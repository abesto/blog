// This script shows an example for integrating the Raphael and Knockout libraries.

(function() {
    var Graph, View, helpers;

    //## Event handlers for GUI actions
    // Set up handlers for events fired via the eve library
    // bundled with Raphael.js, returning a function that sets the current action
    function initActions() 
    {
        var currentAction = 'noop', actions;

        // First level: selected action<br>
        // Second level: event name after `graph.` prefix
        actions = {
            'create-node': {
                'paper-clicked': function() { this.createNode(); }
            },

            'delete-node': {
                'node-clicked': function(node) { this.deleteNode(node); }
            },

            'create-edge': {
                'node-dnd-node': function(from, to) { this.connect(from, to); }
            },

            'delete-edge': {
                'edge-clicked': function(edge) { this.deleteEdge(edge); }
            }
        };

        // Bind to all graph events, call appropriate handler if exists
        eve.on('graph.*', function() {
            console.log("Controller received event " + eve.nt(), this, arguments);
            var parts = eve.nt().split('.');
            if (typeof(actions[currentAction]) != 'undefined' &&
                typeof(actions[currentAction][parts[1]]) != 'undefined') {
                    actions[currentAction][parts[1]].apply(this, arguments);
                }
        });

        // The function to set the action
        return function(a) { 
            console.log("Action set to " + a);
            currentAction = a; 
        }
    };

    //## Graph model
    Graph = (function() {
        var Node, Edge, Constructor, gid = 0, eid = 0, nid = 0;


        // **Simple node model**. Note that label and color are observables,
        // while the edges will be observable on the graph model.
        // You'll probably want to have a list of in-edges and out-edges in
        // real uses.
        Node = function Node(graph)
        {
            this.graph = graph;
            this.type = 'node';
            this.label = ko.observable('N' + (nid++));
            this.color = ko.observable('red');
        };

        // **Simple edge model**. Note again that label and color are observables.
        Edge = function Edge(graph, from, to)
        {
            this.graph = graph;
            this.type = 'edge';
            this.label = ko.observable('E' + (eid++));
            this.color = ko.observable('black');
            this.from = from;
            this.to = to;
        };

        // **Graph model**. This is a bit more complex.
        // 
        // The node and edge lists are `observableArray` objects.
        // `createNode`, `deleteNode`, `connect` and `deleteEdge` operate on them.
        Constructor = (function() {
            var Graph = function Graph() {
                this.id = gid++;
                this.nodes = ko.observableArray();
                this.edges = ko.observableArray();
            };

            Graph.prototype.createNode = function() {
                var node = new Node(this);
                this.nodes.push(node);
                return node;
            };

            Graph.prototype.deleteNode = function(node) {
                var i, edges, edge;
                node.graph = null;
                this.nodes.remove(node);
                edges = this.edges();
                for (i in edges) {
                    edge = ko.utils.unwrapObservable(edges[i]);
                    console.log(i, edge, node);
                    if (edge.from == node || edge.to == node) {
                        this.deleteEdge(edge);
                    }
                }
            };

            Graph.prototype.connect = function(from, to) {
                var edge = new Edge(this, from, to);
                this.edges.push(edge);
                return edge;
            };

            Graph.prototype.deleteEdge = function(edge) {
                edge.graph = null;
                this.edges.remove(edge);
            };

            return Graph;
        })();

        return Constructor;
    })();

    //## Custom Knockout binding handlers

    //### element.attr
    // Create a Knockout binding handler calling the Raphael `.attr` method.
    // 
    // `paper` is a required parameter because handlers must be bound to DOM
    // objets, and there's no way to get the Raphael paper object from an
    // SVG or VML object.
    // 
    // The handler returned by this function accepts a hash as argument.
    // The `.attr` method will be called with the key-value pairs specified
    // in the hash for the updated object.
    // 
    // Values can be KO observables (this is the point of the whole thing)
    function createRaphaelAttrBindingHandler(paper)
    {
        return {
            update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var dict = ko.utils.unwrapObservable(valueAccessor()), key;
                for (key in dict) {
                    paper.getById(element.raphaelid).attr(key, ko.utils.unwrapObservable(dict[key]));
                }
            }
        };
    }


    //### Nodes
    // Creates a KO binding to handle node creation/removal
    function createNodesBindingHandler(paper)
    {
        // Store a list of node views
        paper.nodes = [];

         // Create the representation of a recently created node model
         //
         // Position is specified by the lastClick property of the paper,
         // which is the last click event received by the paper (saved by us).
        function createView(node)
        {
            var x, y, circle, label, st;
            x = paper.lastClick.originalEvent.layerX;
            y = paper.lastClick.originalEvent.layerY;
            
            // Create the Raphael objects
            circle = paper.circle(x, y, 20).attr('fill', 'white');
            label = paper.text(x, y, node.label());
            st = paper.set().push(circle, label);

            // Set the model on every object, so it's easy to get it in event handlers
            circle.model = node;
            label.model = node;
            st.model = node;
            node.circle = circle;

            // Add the view to our list
            paper.nodes.push(st);

            // This is where we set up the KO bindings.
            // `color` and `label` are observables of the Node model. `p1_r_attr` is the
            // handler returned by the above `createRaphaelAttrBindingHandler` function,
            // hard-coded here for simplicity.
            $(circle.node).attr('data-bind', 'p1_r_attr: { stroke: color }');
            $(label.node).attr('data-bind', 'p1_r_attr: { fill: color, text: label }');
            ko.applyBindings(node, circle.node);
            ko.applyBindings(node, label.node);
            
            // Fire node-clicked event and prevent the click from reaching the paper
            st.click(function(event) {
                eve('graph.node-clicked', node.graph, node); 
                event.preventDefault(); 
            });

            // Currently the only case of dragging we care about is when
            // a node is dropped on another node
            st.drag(
                    null,  // onmove
                    null,  // onstart
                    function(event) { 
                        var fromModel = node,
                            ontoView = paper.getElementByPoint(event.x, event.y);
                        // Is there an element where user stopped dragging?
                        if (ontoView != null) {
                            // If so, fire an appropriate event
                            // The event name will be graph.node-dnd-node or graph-node-dnd-edge
                            // The event handler will be called with the graph as context,
                            // arguments will be the nodes we're connecting
                            var ontoModel = ontoView.model;
                            eve('graph.node-dnd-' + ontoModel.type, fromModel.graph, fromModel, ontoModel); 
                        }
                    }
            );
        }

        return {
            // This is the actual method that will be called by KO
            // 
            // The relation between the number of nodes in the graph model and the views list
            // declared above tells us what has happened:
            // 
            // Requirements:
            //  - Only one element is added / removed at a time
            //  - Adding only happens at the end of the node array (push)
            //  - The graph property of a removed Node model is set to null _before_ being removed
            update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var i,
                    models = ko.utils.unwrapObservable(valueAccessor()),
                    views  = paper.nodes;

                // The relation between the number of nodes in the graph model and the views list
                // declared above tells us what has happened:

                // Nothing interesting
                if (models.length == views.length) {
                    return;
                // A new node has been created
                } else if (models.length == views.length + 1) {
                    createView(models[models.length-1]);
                // A node has been removed. Which one?
                // We required that the graph property of removed nodes be set to null.
                // This is where we use that, to find out which node to remove.
                } else if (models.length == views.length - 1) {
                    for (i = 0; i < views.length; i++) {
                        if (views[i].model.graph == null) {
                            views[i].remove();
                            views.splice(i, 1);
                            break;
                        }
                    }                   
                } else {
                    // This should never happen.
                    throw "Mayday!";
                }
            }
        };
    }

    //### Edges
    // Completely analogous to `createNodeBindingHandler` above
    //
    // It's probably possible to refactor some these two functions, they share
    // a lot of code
    function createEdgesBindingHandler(paper)
    {
        paper.edges = [];

        function createView(edge)
        {
            var x, y, path, from, st;
            x = paper.lastClick.originalEvent.layerX;
            y = paper.lastClick.originalEvent.layerY;
            
            window.to = edge.to;

            path = paper.path('M' + edge.from.circle.attr('cx') + ',' + edge.from.circle.attr('cy') +
                              'L' + edge.to.circle.attr('cx') + ',' + edge.to.circle.attr('cy')
            );
            label = paper.text(
                    (edge.from.circle.attr('cx') + edge.to.circle.attr('cx')) / 2, 
                    (edge.from.circle.attr('cy') + edge.to.circle.attr('cy')) / 2,
                    edge.label()
            );
            st = paper.set();
            st.push(path, label);

            label.model = edge;
            path.model = edge;
            st.model = edge;

            edge.path = path;
            paper.edges.push(st);

            $(path.node).attr('data-bind', 'p1_r_attr: { stroke: color }');
            $(label.node).attr('data-bind', 'p1_r_attr: { fill: color, text: label }');
            
            st.click(function(event) { 
                eve('graph.edge-clicked', edge.graph, edge); 
                event.preventDefault(); 
            });

            ko.applyBindings(edge, path.node);
            ko.applyBindings(edge, label.node);
        }

        return {
            update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var i,
                    models = ko.utils.unwrapObservable(valueAccessor()),
                    views  = paper.edges;

                if (models.length == views.length) {
                    return;
                } else if (models.length == views.length + 1) {
                    createView(models[models.length-1]);
                } else if (models.length == views.length - 1) {
                    for (i = 0; i < views.length; i++) {
                        if (views[i].model.graph == null) {
                            views[i].remove();
                            views.splice(i, 1);
                            break;
                        }
                    }                   
                } else {
                    throw "Mayday!";
                }
            }
        };
    }


    // Finally we set up the main interface
    $(function() {
        var g, paper, setAction;

        g = new Graph();
        paper = Raphael('canvas');

        ko.bindingHandlers.nodes = createNodesBindingHandler(paper);
        ko.bindingHandlers.edges = createEdgesBindingHandler(paper);
        $('#canvas').data('graph', g).attr('data-bind', 'nodes: nodes, edges: edges');
        ko.bindingHandlers.p1_r_attr = createRaphaelAttrBindingHandler(paper);
        
        ko.applyBindings(g);

        setAction = initActions(paper, g);

        $('#controls input').each(function() { 
            $(this).click(function() { setAction(this.id); });
        });

        $('#canvas').click(function(event) {
            paper.lastClick = event;
            eve('graph.paper-clicked', g);
        });
    });
})();

#!/bin/bash

set -euo pipefail

date=$(date +%Y-%m-%d)
filename="_posts/$date-in-the-news-${date}.md"

cat <<EOF > "$filename"
---
title: In the news - ${date}
tags:
  - news
---

EOF

while read url; do
    title="$(curl -qsL "$url" | xmllint --html --xpath '/html/head/title/text()' - 2>/dev/null)"
    echo -e "[${title}](${url})  \nTBD\n\n" >> "$filename"
    echo "Processed ${url} - ${title}"
done

echo "$filename"
cat "$filename"

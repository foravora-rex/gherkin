#!/bin/sh
cp scripts/setup-hooks.sh .git/hooks/pre-push
echo '#!/bin/sh\nnpm test' > .git/hooks/pre-push
chmod +x .git/hooks/pre-push
echo "Git hooks installed."

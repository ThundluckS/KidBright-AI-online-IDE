#!/bin/bash
npm run build
scp -r dist/* docker-1:/var/www/kidbright


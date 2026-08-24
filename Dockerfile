FROM node:24.19-bookworm

WORKDIR /opt/webring

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --production

COPY --chown=node:node . .

USER node

CMD ["node", "index.js"]


FROM node:24.19-bookworm

LABEL org.opencontainers.image.source="https://github.com/hearthsinger/webring"
LABEL org.opencontainers.image.description="A really bad webring server"
LABEL org.opencontainers.image.licenses="GPL-3.0"

WORKDIR /opt/webring

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --production

COPY --chown=node:node . .

USER node

CMD ["node", "src/index.js"]


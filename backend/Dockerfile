FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY start.sh ./start.sh
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

EXPOSE 5000

CMD ["sh", "./start.sh"]

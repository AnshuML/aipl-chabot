FROM node:18-alpine as build
WORKDIR /app
COPY chat-frontend/package.json chat-frontend/package-lock.json* ./
RUN npm install
COPY chat-frontend ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=5173
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]

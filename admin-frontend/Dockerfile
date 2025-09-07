FROM node:18-alpine as build
WORKDIR /app
COPY admin-frontend/package.json admin-frontend/package-lock.json* ./
RUN npm install
COPY admin-frontend ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=5174
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 5174
CMD ["serve", "-s", "dist", "-l", "5174"]

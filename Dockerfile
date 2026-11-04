FROM node:slim
WORKDIR /web
COPY ["package*.json", "."]
RUN npm ci
COPY . .
RUN npm run lint
ARG NEXT_PUBLIC_API_BASE_URL
RUN npm run build
CMD ["npm", "run", "start"]

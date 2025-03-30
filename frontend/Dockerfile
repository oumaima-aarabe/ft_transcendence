FROM node:20

WORKDIR /app

COPY package*.json ./

# handle dependency conflicts
# allows installation with conflicting peer dependencies
RUN npm install --force

COPY . .

EXPOSE 3000

CMD npm run build && npm run start
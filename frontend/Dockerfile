FROM node:20

WORKDIR /app

COPY package*.json ./

# handle dependency conflicts
# allows installation with conflicting peer dependencies
RUN npm install --legacy-peer-deps


COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
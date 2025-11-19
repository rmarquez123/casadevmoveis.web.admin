# Step 1: Build the Angular application
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY usedfurniture.web/package*.json ./
RUN npm install

# Copy app source code and build
COPY usedfurniture.web/ ./
RUN npm run build --configuration=production

# Step 2: Serve with NGINX
FROM nginx:alpine

# Copy Angular build output
COPY --from=build /app/dist/usedfurniture.web /usr/share/nginx/html

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

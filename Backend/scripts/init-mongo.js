db = db.getSiblingDB("blog_db");

db.createUser({
  user: "blog_user",
  pwd: "blog_password",
  roles: [
    {
      role: "readWrite",
      db: "blog_db",
    },
  ],
});

db.createCollection("users");
db.createCollection("posts");

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ title: "text", content: "text" });

print("Database initialized successfully!");

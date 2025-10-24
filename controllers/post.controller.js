const posts = require("../db/posts.json");

const getAllPosts = (userId) => {
  return posts.filter((el) => el.userId === userId);
};

const getPostById = (id) => {
  return posts.find((post) => post.id === id);
};

module.exports = {
  getAllPosts,
  getPostById,
};
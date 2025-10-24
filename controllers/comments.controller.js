const comments = require("../db/comments.json");

const getAllcomments = () => {
  return comments
};

const getPostById = (id) => {
  return comments.find((post) => comments.id === id);
};

module.exports = {
  getAllcomments,
  getPostById,
};
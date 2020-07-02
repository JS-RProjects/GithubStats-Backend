const express = require('express');

const routes = express.Router();

const UserController = require('./controllers/UserController');
const RepoController = require('./controllers/RepoController');

routes.get('/users/:username',UserController.show);

routes.get('/users/:username/repos',RepoController.index);
routes.get('/users/:username/repos/:repo',RepoController.show);

module.exports = routes;
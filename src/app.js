const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const validateRepo = (request, response, next) => {
  const { id } = request.params;
  
  if(!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid Id'});
  }
  
  return next();
}

// repo: {id: string, title: string, url: string, techs: string[], likes: number}
const state = {
  repositories: [],
}

const findRepo = id => state.repositories.filter(repo => repo.id === id).length > 0;

app.use("/repositories/:id", validateRepo);

app.get("/repositories", (request, response) => {
  return response.json(state.repositories);
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;

  const newRepo = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  state.repositories = [...state.repositories, newRepo];

  return response.json(newRepo);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  
  if(!findRepo(id)) {
    return response.status(400).json({ error: 'Repo not found' });
  }

  const {title, url, techs} = request.body;

  state.repositories = state.repositories.map(repo => {
    if (repo.id === id) {
      return {
        title: title || repo.title,
        url: url || repo.url,
        techs: techs || repo.techs,
        id,
        likes: repo.likes
      }
    }
    return repo;
  });

  return response.json(...state.repositories.filter(repo => repo.id === id));
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  
  const findRepo = state.repositories.filter(repo => repo.id === id);

  if (!findRepo.length) {
    return response.status(400).json({ error: 'Repo not found' });
  }

  state.repositories = state.repositories.filter(repo => repo.id !== id);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  
  const findRepo = state.repositories.filter(repo => repo.id === id);

  if (!findRepo.length) {
    return response.status(400).json({ error: 'Repo not found' });
  }

  findRepo[0].likes = findRepo[0].likes + 1;

  state.repositories.map(repo => {
    if(repo.id === findRepo[0].id) {
      return findRepo[0];
    }
    return repo;
  });

  return response.json(findRepo[0]);
});

module.exports = app;

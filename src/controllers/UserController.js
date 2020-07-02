const dotenv = require('dotenv');
dotenv.config();

const api = require('axios').create({ baseURL: process.env.GITHUB_API_URL });
const headers = {
    headers: {
        Authorization: `token ${process.env.API_TOKEN}`
    }
};

module.exports = {
    async show(req,res){
        function get_stargazers_count(repos){
            let stars = 0;

            for (let i = 0; i < repos.length; i++){
                stars = stars + repos[i].stargazers_count;
            }

            return stars;
        }

        const { username } = req.params;

        let user;
        let user_repos;

        try {
            user = await api.get(`/users/${username}`,headers);
            user_repos = await api.get(`/users/${username}/repos`,headers);
        } catch {
            return res.json({
                error: 'Consultas a API esgotadas!'
            });
        }
        const user_stars = get_stargazers_count(user_repos.data);

        const created_at = String(user.data.created_at).split('T')[0];

        const data = {
            name: user.data.name,
            username: username,
            description: user.data.bio,
            url: user.data.html_url,
            avatar: user.data.avatar_url,
            location: user.data.location,
            followers: user.data.followers,
            repos_count: user.data.public_repos,
            gists_count: user.data.public_gists,
            stars_received: user_stars,
            created_at: created_at,
            response_headers: user.headers,
            calls_resets: new Date(parseInt(user.headers['x-ratelimit-reset']) * 1000)
        }

        return res.json(data);
    }
};
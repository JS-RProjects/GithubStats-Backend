const dotenv = require('dotenv');
dotenv.config();

const api = require('axios').create({ baseURL: process.env.GITHUB_API_URL });
const headers = {
    headers: {
        Authorization: `token ${process.env.API_TOKEN}`
    }
};

function readableBytes(bytes) {
    var i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

module.exports = {
    async index(req,res){
        const { username } = req.params;

        let user_repos;

        try{
            user_repos = await api.get(`/users/${username}/repos`,headers);
        } catch {
            return res.json({
                error: 'Consultas a API esgotadas!'
            });
        }

        let repos = [];

        for (let i = 0; i < user_repos.data.length; i++){
            const x = user_repos.data[i];
            const repo = {
                name: x.name,
                full_name: x.full_name,
                url: x.html_url,
                description: x.description,
                size: readableBytes(x.size * 1024),
                language: x.language,
                stars: x.stargazers_count,
                forks: x.forks_count,
                issues: x.open_issues_count,
                license: x.license ? x.license.spdx_id : null,
                created_at: String(x.created_at).split('T')[0]
            }
            repos.push(repo);
        }

        const data = {
            repos_count: user_repos.data.length,
            repos: repos
        };

        return res.json(data);
    },

    async show(req,res){
        const { username,repo } = req.params;
        let user_repos;
        let user_repos_stats;

        try{
            user_repos = await api.get(`/repos/${username}/${repo}`,headers);
            user_repos_stats = await api.get(`/repos/${username}/${repo}/stats/contributors`,headers);
        } catch {
            return res.json({
                error: 'Consultas a API esgotadas!'
            });
        }

        const data = {
            name: user_repos.data.name,
            full_name: user_repos.data.full_name,
            url: user_repos.data.html_url,
            description: user_repos.data.description,
            size: readableBytes(user_repos.data.size * 1024),
            language: user_repos.data.language ? user_repos.data.language : null,
            stars: user_repos.data.stargazers_count,
            forks: user_repos.data.forks_count,
            issues: user_repos.data.open_issues_count,
            license: user_repos.data.license ? user_repos.data.license.spdx_id : null,
            created_at: String(user_repos.data.created_at).split('T')[0],
            total_commits: user_repos_stats.data[0].total,
        };

        return res.json(data);
    }
};
module.exports = {
    apps: [
        {
            name: 'api_nest',
            script: 'dist/main.js',
            cwd: './api_nest',
            env: {
                NODE_ENV: 'production',
                PORT: 5001,
            },
        },
        {
            name: 'web',
            script: 'npm',
            args: 'start',
            cwd: './web',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
        },
        {
            name: 'admin',
            script: 'npm',
            args: 'start',
            cwd: './admin',
            env: {
                NODE_ENV: 'production',
                PORT: 3002,
            },
        },
        {
            name: 'landing',
            script: 'npm',
            args: 'start',
            cwd: './landing',
            env: {
                NODE_ENV: 'production',
                PORT: 3003,
            },
        },
        {
            name: 'marketplace',
            script: 'npm',
            args: 'start',
            cwd: './marketplace',
            env: {
                NODE_ENV: 'production',
                PORT: 3004,
            },
        },
    ],
};

const dotenv = require('dotenv').config();
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');

const PROJECT_NAME = 'keystoneblog';
const adapterConfig = {
    mongoUri: process.env.MONGO_URI,
};

/**
 * You've got a new KeystoneJS Project! Things you might want to do next:
 * - Add adapter config options (See: https://keystonejs.com/keystonejs/adapter-mongoose/)
 * - Select configure access control and authentication (See: https://keystonejs.com/api/access-control)
 */
const PostSchema = require('./list/Post');
const UserSchema = require('./list/User');

const isLoggedIn = ({ authentication: { item: user } }) => {
    return !!user;
};

const isAdmin = ({ authentication: { item: user } }) => {
    return !!user && !!user.isAdmin;
};
const keystone = new Keystone({
    adapter: new Adapter(adapterConfig),
    cookieSecret: process.env.COOKIE_SECRET,
});

keystone.createList('Post', {
    fields: PostSchema.fields,
    access: {
        read: true,
        create: isLoggedIn,
        update: isLoggedIn,
        delete: isLoggedIn,
    },
});

keystone.createList('User', {
    fields: UserSchema.fields,
    access: {
        read: true,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
    },
});

const authStrategy = keystone.createAuthStrategy({
    type: PasswordAuthStrategy,
    list: 'User',
    config: {
        identityField: 'email',
        secretField: 'password',
    },
});
module.exports = {
    keystone,
    apps: [
        new GraphQLApp(),
        new AdminUIApp({
            name: PROJECT_NAME,
            enableDefaultRoute: true,
            authStrategy,
            isAccessAllowed: isAdmin,
        }),
    ],
};

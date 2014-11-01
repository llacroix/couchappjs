# Couchapp

Couchappjs is inspired by the couchapp program written in Python.
The idea of both program are the same except that the nodejs version
might bring some more improvement that are unlikely to happen with the 
python version.

Couchappjs currently handles those functions
    
- filters
- views
- updates
- shows
- lists

It also support loading CommonJS modules into couchdb. CommonJS modules are
currently scoped into "commonjs/*". But that could be changed in the future to
give a bit more control over how the design documents should endup.

The other big point is that Bower can be integretaded without much problems
into the couchapp API.

# Installation

You can install it globally using npm

    npm install -g couchapp

# Usage

There are currently only 2 functions

## couchapp init

Initialize the project in a folder of the name of the project. It generates a file
named `couchapp.json` that contains the configurations necessary to push the project
on the database.


### useBower

When true, push file contained in bower_components that are necessary for the
application. It use the main attribute in bower.json contained in `attachments/`. 
If useBower is false, it will add any file contained inside `attachments/`.


## couchapp sync

Used to sync the application to the database. By default it use the dev target
that is located in `couchapp.json` file.

Options:

- --pretend, -p Pretend to push to the server but instead just render the document to stdout Can be used for debugging
- --watch, -w Watch the current directory for any changes and rebuild the design document

# TODO

- [ ] search installed npm packages for plugins
- [ ] store CommonJS modules for views in `views/lib/*`
- [ ] reroot CommonJS into the design documents instead of storing everything in `commonjs/*` 

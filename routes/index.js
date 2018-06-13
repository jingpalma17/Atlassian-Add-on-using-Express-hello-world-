module.exports = function (app, addon) {

    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
        res.format({
            // If the request content-type is text-html, it will decide which to serve up
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            // This logic is here to make sure that the `atlassian-connect.json` is always
            // served up when requested by the host
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
    });

    // This is an example route that's used by the default "generalPage" module.
    // Verify that the incoming request is authenticated with Atlassian Connect
    app.get('/hello-world', addon.authenticate(), function (req, res) {
            // Rendering a template is easy; the `render()` method takes two params: name of template
            // and a json object to pass the context in
            res.render('hello-world', {
                title: 'Atlassian Connect'
                //issueId: req.query['issueId']
            });
        }
    );

    // This is an example route that's used by the default "webPanels" module.
    // Verify that the incoming request is authenticated with Atlassian Connect
    app.get('/configuration', function(req,res){
        //this will render the template "configuration.hbs"
        res.render("configuration", {id : req.query['id'], type : req.query['type'] });
    });
    
    // This is an example route that's used by the default "jiraIssueTabPanels" module.
    // Verify that the incoming request is authenticated with Atlassian Connect
    app.get('/audit-trail', addon.checkValidToken(), async function (req, res) {
        //this will render the template "audit-trail'.hbs"
        res.render('audit-trail', {
            title: 'Audit Trail'
        });
    });

    // This is an example route that's used by the default "jiraProjectPages" module.
    // Verify that the incoming request is authenticated with Atlassian Connect
    app.get('/project', addon.authenticate(), function (req, res) {
        //this will render the template "project-page'.hbs"
        res.render('project-page', {
            title: 'Project Page'
        });
    });

    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync("routes");
        for(var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }
};
//test
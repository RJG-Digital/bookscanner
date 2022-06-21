# bookscanner
This app scans ar books

# build ionic for production
ng build --configuration=production
ionic capacitor sync android
ionic capacitor sync ios

# to run heroku
heroku login
git add .
git commit -m {commit message}
git push heroku main

# if Heroku is not found 
heroku git:remote -a arscanner

# to reset pupetter build packs
heroku buildpacks:clear
$ heroku buildpacks:add --index 1 https://github.com/jontewks/puppeteer-heroku-buildpack
$ heroku buildpacks:add --index 1 heroku/nodejs
Then, add the following args to the puppeteer launch function:

const browser = await puppeteer.launch({
  'args' : [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
});
Finally, deploy it back to Heroku:

$ git add .
$ git commit -m "Fixing deployment issue"
$ git push heroku master

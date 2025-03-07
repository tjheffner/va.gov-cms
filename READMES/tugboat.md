# Tugboat 101

## Summary of Tugboat
[Tugboat](https://www.tugboat.qa) (SOCKS required to access) is a fast, modern Preview Environment creation tool based on containers ([Docker Swarm](https://docs.docker.com/engine/swarm/)). Tugboat creates "Previews" which are environments that you can test proposed code changes in, login with a web shell, and view logs in the UI. Each Preview is built from a Base Preview.

At VA, Tugboat is used primarily in conjunction with the CMS and content-build. It's helpful to understand a couple of basic terms from Tugboat, to make clear how lower environments receive their data.  

Tugboat contains **Projects**. Each Project can contain **Repositories** (not related to Github). Each Repository then has a **Base Preview**, and **Previews**. 
* **Previews**, or PR Previews, are the built environments you interact with for a given set of Pull Request (PR) changes.
* **Base Preview** 
Take the term Base to mean bottom or foundation: Base Preview is a container, built from a versioned state of the CMS code, with a production database snapshot baked in. Tugboat uses Base Previews to make PR Preview creation quick and disk storage efficient. After a 30-40min build, Base Previews are ready to layer va.gov-cms code changes on top and run post-deploy operations (updatedb, config:import). 

## VA Usage
At VA, our lower environments are each built from a Tugboat Base Preview, in some fashion. Our Tugboat configuration is relevant to the discussion:  

1. **Project**: [CMS PROD Mirrors](https://tugboat.vfs.va.gov/6042eeed6a89948104399d3c) 
    1. **Repository**: [Mirrors](https://tugboat.vfs.va.gov/6042eeed6a89945a99399d3d) 
        1. **Base Preview**: Built daily at 7am UTC (2am EST, 1am EDT). This data will then be used on Staging until the next time this Base Preview is refreshed.
        2. **Previews**: [content-build-branch-builds](https://tugboat.vfs.va.gov/6189a9af690c68dad4877ea5) — This Prod mirror snapshot of code + data backups is the base for building Staging.
1. **Project**: [CMS](https://tugboat.vfs.va.gov/5fd3b8ee7b465711575722d5)
    1. **Repository**: [CMS Demo Environments](https://tugboat.vfs.va.gov/5ffe2f4dfa1ca136135134f6) — Is used for building Demo & Training Previews, manually triggered.
    2. **Repository**: [CMS Pull Request Environments](https://tugboat.vfs.va.gov/5fd3b8ee7b4657022b5722d6) — Is used for managing PR Previews, automatically trigged by Pull Requests in va.gov-cms or content-build repos.
        1. **Base Preview**: Built nightly at 10am UTC (5am EST, 4am EDT). This data will then be used for all va.gov-cms and content-build PR Preview envs until the next time this Base Preview is refreshed.
 
**Refresh**:
*  .tugboat/config.ymlPHP and MySQL update commands
* loads the latest Database and Asset file snapshot from AWS S3.

Each Repository's Base Preview image is refreshed on a daily schedule, which downloads and applies the previous day's Production Post Deployment Asset Files and Database backups. Then, when you launch your PR it launches from that state and doesn't have to sync the file assets or database snapshot and will only run your code updates (`drush updatedb`) and configuration import (`drush config:import`) and then posts a GitHub comment to your pull request with links to your preview environment(s).

## Other environments' uses of Tugboat and data
[Environments & the Content Build Process](https://github.com/department-of-veterans-affairs/va.gov-cms/blob/main/READMES/environments.md) (Github)


## Getting started with CMS Pull Request Preview Environments
1. Log in to the Tugboat dashboard (internal) https://tugboat.vfs.va.gov. When you first log in with GitHub, you need to wait up to 2 minutes for your user account to be granted access to project(s) by a cron script that runs every minute (we are working on making this instant eventually). After you have waited the 2 minutes:
1. Click the "CMS" project then click "CMS Pull Request Environments"
1. Make a pull request
1. A "Deployment in Progress" message will appear on your GitHub Pull Request, and you will see a new environment appear simultaneiously in the Tugboat dashboard. With the dashboard you can view the preview environment system logs or launch a "terminal" to modify code and/or run drush commands etc.
1. Within 3 minutes a your new preview environment should be created and a GitHub comment will be posted with links to your environment(s) for testing, this includes a WEB (web-\*) link that builds the static site for testing. The WEB environment will take a while to build and will only be stable after all tests pass.
1. After the GitHub comment is posted with your environment links, tests will start running and the checks in the GitHub status check section will switch from "Expected" to "Pending", this test run step will take closer to 30+ minutes to complete.

## Getting started with CMS Demo Preview Environments

### Maintenance and retention policy

1. Demo Preview Environments that are inactive for 30 days are subject to deletion. Run the "Lock" operation to prevent this from happening. 
1. Demo environments must follow this naming pattern:
   1. For VAMC Systems - `<Geographic location> health care`. E.g. Alexandria health care.
   1. For other CMS products - `<Product name>`. E.g. Resources and support
   1. For personal sandboxes - `<First name Last name>'s Sandbox`. E.g. Dave Conlon's Sandbox.
   1. Avoid creating environments with duplicate names. Check the list of existing environment while sorting by title to quickly scan the list to ensure an environment you're about to create doesn't already exist.


### Creating new CMS Demo Preview Environment:

1. Login to Tugboat using GitHub - [Tugboat Projects](https://tugboat.vfs.va.gov/projects)
1. Navigate to CMS > CMS Demo Environments repository OR use a direct link [Tugboat CMS Demo Environments repository](https://tugboat.vfs.va.gov/5ffe2f4dfa1ca136135134f6)
1. Locate "Base Previews" section
   1. Scroll down to locate **Base Previews** section.
1. Clone base preview to create a new Demo Preview Environment.
   1. Locate **main** base preview.
   1. Click on **Actions > Clone**. You have created a clone of base preview environment.
1. Rename the newly created clone.
   1. Locate "main" environment in "Preview" section at the top of the page.
   1. Click "Settings".
   1. Enter new environment name .
   1. Do not change any other settings.
   1. Click "Save Configuration", then "Back to Preview".
   
You have created a new CMS Demo Preview Environment.

### Human-friendly URLs for CMS Demo Preview Environments

Default URL aliases for CMS and WEB UI are not readable. Alias enhancement is tracked in [#4162](https://github.com/department-of-veterans-affairs/va.gov-cms/issues/4162).

Example:
1. `https://cms-kewq6ooqnvg8hzjyzc1luyb4wm8bncmw.demo.cms.va.gov/`
1. `https://web-kewq6ooqnvg8hzjyzc1luyb4wm8bncmw.demo.cms.va.gov/`

Tugboat allows for manual URL customization if there is a need to share a human-redable URL with a stakeholder.

The format is {preview_type}-{custom_name}-{environment_token}.demo.cms.va.gov.
Any alphanumeric characters can be used for {custom_name}.

For example, when creating the 'Wilmington health care' demo environment, these URLs could be modified as follows:

1. `https://cms-wilmington-kewq6ooqnvg8hzjyzc1luyb4wm8bncmw.demo.cms.va.gov/`
1. `https://web-wilmington-kewq6ooqnvg8hzjyzc1luyb4wm8bncmw.demo.cms.va.gov/`


## Tips
1. Refresh, Rebuild and Reset operations.   
    Learn more at https://docs.tugboat.qa/building-a-preview/preview-deep-dive/how-previews-work. Below is a quick summary that might help clarify
    1. Refresh: Starts at "update" stage, then "build" stage, then "online" stage, see .tugboat/config.yml. "Refresh" is what you want to run to just get a fresh database snapshot (think (re)fresh database) and file asset import from recent production backups. ~10 minutes
    1. Rebuild: Starts at "build" stage, then "online" stage, see .tugboat/config.yml. "Rebuild" does not sync the latests database snapshot and file assets. ~3 minutes 
    1. Reset: Resets your database and code to the state it was when the Preview environment was created. <1 minute 
1. Clone: Clones the Preview Environment of the database and codebase/filesystem state at the time it was created, and not the current state. <1 minute
1. Environments are deleted on a PR merge/close by default. "Lock" the environment to prevent deletion.
1. There should only be one "Base Preview" built on main
    1. The base preview **refreshes** (_not_ rebuilds) daily at 4pm ET, just after our prod.cms.va.gov daily deployment
1. You can change the prefix on any environment, all that matters is the token in the URL, e.g. https://pr165-z82nl225gxrzbpcmfxt34th673gtwpmu.tugboat.vfs.va.gov/ will go to the same place as https://rainboxes-z82nl225gxrzbpcmfxt34th673gtwpmu.tugboat.vfs.va.gov/, they are the same. The exception is that if any URL starts with `web-*` then it will be routed to the /docroot/static folder to serve out the static website (vets-website), see .htaccess).

## Common Tugboat operations

| I want to... | Then you should... |
| :--- | :--- |
| Re-run tests on my pull request | Run the "Rebuild" action, this will run the "BUILD" stage and then run the "ONLINE" stage, which will run the tests. |
| Update the base preview image with latest Production DB snapshot | Go to dashboard and "rebuild" the base preview (main). Normally this happens every day automatically and you shouldn't need to do this, but if you do, that is how. |
| Get the latest database on my pull request environment | Run the "Refresh" command to run the "Update" stage of the "mysql" service which pulls in the latest database and files snapshots (within 15 minutes of freshness) |
| See why my deploy failed | Go to the dashboard, find your PR and click the 'php' service title, then click "build logs" |
| Lock my environment from getting deleted, like after my PR is closed. | Use the "LOCK" action |
| Manually create an environment from a branch, tag, or pull request | First push to upstream, then go to branches and click "Build Preview" |
| Test a different `content_build` branch | Go to the Release Content page and select your branch in the autocomplete.  See https://prod.cms.va.gov/help/how-to-release-content-in-the-demo-environment |

## Less common Tugboat operations

| I want to... | Then you should... |
| :--- | :--- |
| Know why the logs are showing a previous build | Change from "current" to the latest timestamp, this is a known issue and we are working on a resolution. You can also use the Tugboat CLI tool with `tugboat log <service id>` to get the log and grep it etc. |
| Search the logs, ctrl + F in my browser is not working | This is not possible in the browser UI, you must use the Tugboat CLI tool with `tugboat log <service id>` and grep the logs that way. |
| Scroll the logs. | This is not possible in the Tugboat UI, use `tugboat log <service id>` to grep or scroll. |
| Run more advanced commands with the `tugboat` tool on the proxy | See the "Tugboat's CLI tool for software engineers" section of this document. |
| Want to get the latest .env file | Run a "Refresh" to run the "Build" stage which re-generates the .env file with latest ENV variables. |
| Use a branch as a base preview for further PRs that will be merged into that branch | Push the base preview branch upstream, then go to branches and click "Build Preview".  From that preview, click "Preview Settings", select "Use this preview as a Base Preview", then select "Branch Base Preview".  PRs representing branches based on the base preview branch will then create previews that use that base preview.| 
| Send an email and capture it in the Tugboat interface | Manually update the email address of the user in question.|
| Make changes in the `init` section of `.tugboat/config.yml` | This will require a manual explicit **rebuild** of the base preview image.|

## Tugboat config testing operations
| I want to... | Then you should... |
| :--- | :--- |
| Test out an 'init' stage change | Push your branch to upstream (can't be a fork) and go to https://tugboat.vfs.va.gov/ and click your project. Then scroll down to the "Available to Build" section, then click the "Branches" tab and then click the dropdown and click "Build with no base preview" |
| Test out an 'update' stage change | TODO |

## Tugboat's CLI tool for software engineers
1. Download at https://tugboat.vfs.va.gov/downloads and put in your $PATH
1. Copy the file from this repo to your home directory `cp .tugboat/.tugboat.yml $HOME/.tugboat.yml`
1. Generate API key at https://tugboat.vfs.va.gov/access-tokens
1. Add token to $HOME/.tugboat.yml
1. Start SOCKS connection
1. Test with `tugboat --help`.
1. See more Tugboat CLI documentation [here](https://docs.tugboat.qa/tugboat-cli/)

## Known issues
1. The generated URLs have only been observed to change when the file .tugboat/config.yml is modified by changing the name of a defined service, or changes the default service.
1. You cannot search logs with a browser right now, it is a known issue. The alternative is to use the `tugboat` CLI tool to view logs. e.g. `tugboat log 6148dc56690c680da87db5f2 | grep -i 'error'`. You can get the service ID from the URL bar in the UI. 
1. You cannot scroll the logs while they are outputting, you can only scroll once they are done. If you want to see previous output then use the Tugboat CLI tool with `tugboat log <service id>` and scroll that way. You can get the service ID from the URL bar in the UI. 
1. Email won't be sent to existing users as their email addresses are blanked during the database sanitization process for the developer database snapshot (see [#6100](https://github.com/department-of-veterans-affairs/va.gov-cms/issues/6100)).  Email to new users, or users whose email addresses have been updated, can be sent and will be captured in the Tugboat interface. If you need to test email in Tugboat then edit a user and add an @example.com email address.
1. Base preview images are **refreshed** automatically, not **rebuilt**.  This means that certain changes to Tugboat config, e.g. in the `init` phase, must be followed by a manual rebuild operation.  The nightly refresh will not incorporate the new changes.
1. Pull requests with code in the body may cause a false alarm on the TIC and be rejected silently, and thus the Tugboat environment will not build automatically.  This is not an issue we or Tugboat can solve.  The only workaround is to build the PR branch manually. See this example of the string `filter_var()` in the webhook POST body causing a firewall block > https://dsva.slack.com/archives/C01A35JDH88/p1675984628181769?thread_ts=1675868445.789729&cid=C01A35JDH88. 

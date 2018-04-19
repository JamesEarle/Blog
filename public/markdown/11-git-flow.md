# Properly Using Git Flow With Your Team

*Learn how to collaborate the right way with others using Git and GitHub*

## Introduction

Many of us have used Git in the past to manage versions of our own personal projects, but just as many *aren't doing it right*. You probably use Git like QuickSave in single player video games. 

- Make progress
- **save** (commit)
- Make progress
- **save** (commit)
- Make progress
- **save** (commit)
- ad infinitum. 

Don't get me wrong this is okay if you're working independently on something small like a school project, but anything larger than that, or anything that requires collaboration **definitely** requires a better workflow.

**Introducing Git Flow!** Git flow offers a structured methodology for working with a team that provides ways of managing merge conflicts and shipping your releases reliably. 

## Git vs. GitHub

If you're reading this and thinking "*why is he explaining something so simple?*" Good. You already know the difference. If you don't know the difference, read on! 

- **Git** is a version control system. You can use it on pretty much any computer anywhere to manage different versions of your code. It is a CLI tool, although there is a small desktop app available when you install it [here.](https://git-scm.com/downloads)

- **GitHub** is a website built for collaboration *using* Git. You can contribute to any public repository here, and find other developers working on this similar to you. It has a small social-network vibe. You can even buy shirts that say "Social Coding" from [GitHub](https://github.myshopify.com/products/social-coding-shirt), so that's a good way to think of this.

Now all this really means is that GitHub is a place to post your code in a public setting. What if you want to use GitHub with a specific set of people, and nobody else can see your code? GitHub offers private repositories, but limits the number when you have a free account. You can, of course, just pay for it. But remember what we just learned, Git is just a tool that *can be put on any computer*. You don't necessarily have to pay Github to have private repos hosted online. You can host private repos in virtual machines you spin up in the cloud, or someone else's server if you have access and want to share with a specific set of people. You can also turn it into your own web app akin to GitHub and only share the URL with the necessary people. 

## The Basics

Simply put, Git Flow exists to keep your work isolated from your team *until the time is right*. I emphasize this because when working in parallel with others there will likely be merge conflicts when you are working on the same code (unless you have narrowly defined tasks). 

The general principle works by having a `master` branch that exists as your history of your release versions, meaning `v1.0`, `v1.3` etc. If you're unfamiliar with [semantic versioning](http://semver.org/) it's worth looking into more. You use the first digit to denote major changes, usually something not backwards compatible. The second digit is for minor changes, something that works in a backwards compatible manner. The third digit is for patches and bug fixes that are similarly backwards compatible. Some corporations like to use a four digit version with the structure of `major.minor.maintenance.build`.

![Example Branch Structure](/uploads/11-example-branch-structure.png)

From your `master` branch you have a `development` branch. This is where changes are merged and tested before they get shipped to a release. You can optionally divide this further by having a `testing` and `development` branch where `testing` contains code that will be put through your testing suite, and `development` contains feature merges from individual working branches. If `development` breaks when these are merged, you know these changes aren't ready for merging with your `testing` branch yet. When all your tests pass on your `testing` branch and you're code is ready, you can merge it into `master`.

## The Workflow

![Create Branch](/uploads/11-branch.png)

So you have some contributions you'd like to make to a collaborative project. The first step is to create your feature branch off of the `development` branch. Development should be up to date with all of the most recent work from other team members, excluding their currently unmerged feature branches. When creating new branches they should be named around what you're contributing like `build-docs`, `db-service-provider` etc. Some groups like to have named branches like `james/server-connection`  for organizational purposes. This helps in tracking work, although GitHub does a pretty good job with that so it's not entirely necessary. In the below diagram, the top-level blue branch would be your `development` branch.

![Work On Branch](/uploads/11-branch-work.png)

Once you have created a new branch, you can make any changes appropriate to your feature. Remember to keep your work on this branch narrowly defined and strictly oriented to your new feature. I have a bad habit of falling into the development rabbit hole (a.k.a [Yak Shaving](https://www.hanselman.com/blog/YakShavingDefinedIllGetThatDoneAsSoonAsIShaveThisYak.aspx)) and finding new problems to work on. This is okay, as long as you work on that new stuff in an appropriate feature branch. If you are working in a branch titled `update-home-css` and you find yourself managing the routes or DB access, you're Yak Shaving.

 ![Open a Pull Request](/uploads/11-pull-request.png)

When changes on a feature branch are at a point you'd consider complete, it's time to open a pull request. Here, you're asking the owner's of the repository "*Please pull my code into yours, I worked really hard on it!*". This is where code review and CI/CD comes into play. Other contributors will look at the work you've done and approve it if they think it's good enough. GitHub has a number of integrations that make this a much easier process for organizations because you can use something like [Travis CI]() to run a test suite against your code base **every time you commit or open a PR**. If your PR fails any tests, then the code review step is unnecessary. The developers already know your code breaks things, so you'll have to get your build passing first. Similarly, this is where any potential merge conflicts become apparent between your `development` and `feature` branches. We'll talk more about merge conflicts a bit later.

![Code Review](/uploads/11-code-review.png)

 Once you've gotten the okay from your respective reviewers, the code will be marked ready to merge. GitHub has a fun emoji :shipit: that shows a squirrel in a top hat that people (like me) like to use to mark code as ready. You can use anything you want for this, so long as you and your team are on the same page about it.

![Ship It!](/uploads/11-shipit.png)

The last step is to merge your work. Once everything is approved it gets brought back into your `development` branch from your `feature` branch. It's important to remember to **delete** your feature branches once they've been merged, or you'll have a messy, unnecessarily large tree structure. Of course this doesn't apply to your `master` and `development` branch though. When you merge into `master` from `development` you keep the master branch alive because the new features will be put here until you're ready for a new release, at which point you'll merge with `master` again.

![Merge Branch](/uploads/11-merge-branch.png)

## Conclusion

Your development work flow will never be perfect, nor should you expect it to be. Often you'll need a file in someone else's feature branch, or have to base your feature branch of an older version of development, or even base your feature branch off of another feature branch. It really can get complex, but if you respect the workflow you're guaranteed to have a well organized repository and workspace for your team.

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*
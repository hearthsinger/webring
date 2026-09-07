# Webring

This is a really dumb webring implementation

You can add yourself to it by adding a new ring member object to the
`src/ring/members.yaml` file.

## Contributing

This project uses [`pre-commit`](https://pre-commit.com) to enforce that the
configured formatter (`prettier`) is run on all files and comes back clean, and
that the `members.yaml` file is formatted properly.

Documentation for installing `pre-commit` can be found elsewhere, it is
recommended that you grab it from your system's package manager rather than
install it as a global python package.

## Dev Setup

After forking this repo, clone your copy and configure your refs as needed.
Ensure that you have `node` and `npm` available on your system. Using `nvm` is
recommended.

Run `npm install` from the root of the repository to download the project
dependencies.

Create a `.env` file containing any development environment variables

The app can be run via `node src/index.js`.

### Minimal changes for new members

1. Ensure that your site config gets added to `src/ring/members.yaml`
2. Run the app locally via `node src/index.js`
3. Open a browser, navigate to `localhost:8080/ring/<some-id>/next` or
   `localhost:8080/ring/<some-id>/prev`, and validate that you are 302'd to the
   sites before and after your new site in the list.
   - You can also pick the site before/after yours and use the `/next`/`/prev`
     routes respectively to ensure you land on your site!
4. Push your changes, make a PR, and leave some details about your site in the
   PR description. Once your PR is merged, you should be in the ring within a
   few moments!

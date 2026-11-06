# Musie website

The download page for Musie, served by GitHub Pages:
https://doombuoy.github.io/Musie_website/

The APK and the YStream plugin are not stored in this repo. They're attached to
this repo's **Releases**, which the app repo's GitHub Actions workflow creates
on every push. The page links to `releases/latest/download/...`, so it always
serves the newest build, and reads the changelog from the Releases API.

# GitHub Actions Workflow

## Build and Release

The `build.yml` workflow runs automatically on every push to `main` or `master` branches.

### What happens on each push:

1. ✅ Chrome extension build
2. ✅ Firefox extension build
3. ✅ ZIP creation (`chrome.zip` and `firefox.zip`)
4. ✅ Artifact upload (available for 30 days)
5. ✅ Automatic GitHub release creation

### GitHub Release

Each release is created with:

- **Tag**: `v{version}-{commit-sha}` (e.g., `v1.0.0-a1b2c3d`)
- **Name**: `Release v{version} ({commit-sha})`
- **Files**: `chrome.zip` and `firefox.zip` attached
- **Description**: Version, commit SHA and message

### Access to builds

- **Artifacts**: Available in GitHub's "Actions" tab (30 days)
- **Releases**: Available in "Releases" tab with downloadable ZIPs

### Customization

If you want to create releases only on tags (instead of every push), modify `.github/workflows/build.yml`:

```yaml
on:
  push:
    tags:
      - "v*"
  workflow_dispatch:
```

And change the tag_name in the "Create GitHub Release" step:

```yaml
tag_name: ${{ github.ref_name }}
```

### Manual trigger

You can also trigger the workflow manually from GitHub's "Actions" tab.

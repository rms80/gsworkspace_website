# Claude Code Notes


# Dev server

- Always use port 4555 (configured in `astro.config.mjs`)

# Git management

- Do not push to git unless I tell you to


## Known Workarounds

### axobject-query ESM compatibility issue (2026-02-07)

**Problem:** Astro 5.17.1 uses `axobject-query@4.x` which has ESM export issues with Vite's dev server, causing console errors like:
```
SyntaxError: The requested module '/@fs/.../axobject-query/lib/index.js' does not provide an export named 'AXObjectRoles'
```

**This is a DEV-ONLY issue.** Production builds on Netlify work fine because Rollup bundles everything correctly. The error only appears in Vite's dev server which serves modules on-the-fly.

**Workaround applied:**
Added Vite config in `astro.config.mjs`:
```js
vite: {
  optimizeDeps: {
    exclude: ['axobject-query'],
  },
  ssr: {
    noExternal: ['axobject-query'],
  },
},
```

This makes the page render correctly in dev mode, but a non-blocking console error still appears. The error does not affect functionality.

**Future fix:** When Astro or axobject-query releases a fix for this compatibility issue, remove the `vite.optimizeDeps.exclude` and `vite.ssr.noExternal` entries for axobject-query from `astro.config.mjs`.

Then run `rm -rf node_modules package-lock.json .astro && npm install` to test.

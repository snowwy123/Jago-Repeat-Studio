# Building Jago Repeat

Use Windows x64 and Microsoft Edge WebView2 Runtime. Install Node.js for the browser build and the .NET Framework C# compiler for the Windows host.

From this repository, run **Build.ps1** in PowerShell. The wrapper uses the included WebView2 SDK. Edit the files under **Source**, then rebuild; generated HTML is build output.

Keep licence notices with redistributed code and binaries.

## Refresher checks

Run `node --test Source/Tests/focus.test.cjs`. With Playwright and Edge available, run `node Source/Tests/refresher-browser.cjs`. That test also expects the Wobble, Material and World repositories beside this one, with their generated index pages, for real adapter checks. `REPEAT_TEST_OUTPUT` chooses an evidence directory; all browser profiles are isolated.

For Windows, copy `Source/Native-probes/refresher.js` to `probe.js` in a new test directory. Set `JAGO_SUITE_ROOT` to a private test location and launch the built app with `--suite-test` and that directory. Never use a real project profile for testing.

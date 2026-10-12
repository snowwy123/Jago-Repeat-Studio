// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Cameron Jago Lis Illustrates.
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: AssemblyTitle("Jago Repeat Studio")]
[assembly: AssemblyProduct("Jago Repeat Studio")]
[assembly: AssemblyCompany("Cameron Jago Lis Illustrates")]
[assembly: AssemblyCopyright("Copyright (c) 2026 Cameron Jago Lis Illustrates")]
[assembly: AssemblyVersion("1.12.0.0")]
[assembly: AssemblyFileVersion("1.12.0.0")]
static class Program
{
    internal static string Root, Files, Test;
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode)]
    static extern bool SetDllDirectory(string path);
    [STAThread]
    static void Main(string[] args)
    {
        try
        {
            if(JagoSuiteBootstrap.ForwardExisting("repeat",args))return;
            Test = JagoSuiteBootstrap.TestRoot(args) ?? (args.Length==2 && args[0]=="--self-test" ? Path.GetFullPath(args[1]) : null);
            Root = Test ?? JagoSuiteBootstrap.WorkspaceProfile ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Jago Repeat Studio");
            string version;
            using(var sha=SHA256.Create()) using(var stream=File.OpenRead(Assembly.GetExecutingAssembly().Location))
                version=BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").Substring(0,16);
            Files=Path.Combine(Root,"Application",version);
            Directory.CreateDirectory(Files);
            foreach(string name in new[]{"index.html","Microsoft.Web.WebView2.Core.dll","Microsoft.Web.WebView2.WinForms.dll","WebView2Loader.dll","WebView2-LICENSE.txt","WebView2-NOTICE.txt"}) {
                if(File.Exists(Path.Combine(Files,name)))continue;
                using(var input=Assembly.GetExecutingAssembly().GetManifestResourceStream("Repeat."+name))
                using(var output=File.Create(Path.Combine(Files,name))) input.CopyTo(output);
            }
            AppDomain.CurrentDomain.AssemblyResolve+=(s,e)=>{
                string file=Path.Combine(Files,new AssemblyName(e.Name).Name+".dll");
                return File.Exists(file)?Assembly.LoadFrom(file):null;
            };
            SetDllDirectory(Files);
            Start();
        }
        catch(Exception e)
        {
            if(Test!=null){Directory.CreateDirectory(Test);File.WriteAllText(Path.Combine(Test,"result.txt"),"FAIL: "+e);}
            else MessageBox.Show("The Windows app could not start. Please check Microsoft WebView2 Runtime is installed, or open Jago-Repeat-Studio.html in your browser.\n\n"+e.Message,"Jago Repeat Studio");
        }
    }
    [MethodImpl(MethodImplOptions.NoInlining)]
    static void Start(){Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);Application.Run(new PrintWindow());}
}
sealed class PrintWindow:Form
{
    WebView2 browser=new WebView2();
    bool ready, closing, testing;
    public PrintWindow()
    {
        if(Program.Test!=null){Opacity=0;ShowInTaskbar=false;} Text="Jago Repeat";ClientSize=new Size(1360,900);MinimumSize=new Size(800,620);
        Icon=Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location);
        browser.Dock=DockStyle.Fill;Controls.Add(browser);Shown+=async(s,e)=>await Initialise();
        FormClosing+=async(s,e)=>{
            if(closing||!ready||Program.Test!=null)return;
            e.Cancel=true;
            try{
                string unsaved=await browser.CoreWebView2.ExecuteScriptAsync("document.activeElement?.blur(); (!window.__workspaceConfirmedClose && !!window.jagoHistory?.dirty)");
                if(unsaved=="\"saving\""){MessageBox.Show(this,"Please let the current save finish before closing.","Saving project");return;}
                if(unsaved=="true" && MessageBox.Show(this,"There are unsaved changes. Close the studio anyway?","Unsaved studio project",MessageBoxButtons.YesNo,MessageBoxIcon.Question)!=DialogResult.Yes)return;
                closing=true;Close();
            }catch{closing=true;Close();}
        };
    }
    async Task Initialise()
    {
        try{
            var env=await CoreWebView2Environment.CreateAsync(null,Path.Combine(Program.Root,"Profile"));
            await browser.EnsureCoreWebView2Async(env);
            var core=browser.CoreWebView2;
            core.SetVirtualHostNameToFolderMapping("jagorepeat.example",Program.Files,CoreWebView2HostResourceAccessKind.DenyCors);
            core.Settings.IsStatusBarEnabled=false;
            core.NavigationStarting+=(s,e)=>{if(!e.Uri.StartsWith("https://jagorepeat.example/",StringComparison.OrdinalIgnoreCase)&&e.Uri!="about:blank")e.Cancel=true;};
            core.NewWindowRequested+=(s,e)=>{
                e.Handled=true;
                if(e.IsUserInitiated && (e.Uri=="https://cameronjagolis.co.uk/" || e.Uri=="https://ko-fi.com/cameronillustrates"))
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(e.Uri){UseShellExecute=true});
            };
            core.PermissionRequested+=(s,e)=>{
                if(e.Uri.StartsWith("https://jagorepeat.example/",StringComparison.OrdinalIgnoreCase) &&
                   e.PermissionKind==CoreWebView2PermissionKind.MultipleAutomaticDownloads)
                    e.State=CoreWebView2PermissionState.Allow;
            };
            core.DownloadStarting+=(s,e)=>{
                var operation=e.DownloadOperation;
                bool project=(Path.GetExtension(e.ResultFilePath).Equals(".json",StringComparison.OrdinalIgnoreCase)||Path.GetExtension(e.ResultFilePath).Equals(".jagorepeat",StringComparison.OrdinalIgnoreCase)),reported=false;
                Action<bool> report=ok=>{
                    if(!project||reported)return;
                    reported=true;
                    core.PostWebMessageAsJson("{\"type\":\"project-save-result\",\"ok\":"+(ok?"true":"false")+"}");
                };
                operation.StateChanged+=(sender,args)=>{
                    if(operation.State==CoreWebView2DownloadState.Completed)report(true);
                    else if(operation.State==CoreWebView2DownloadState.Interrupted)report(false);
                };
                e.Handled=true;
                var deferral=e.GetDeferral();
                // Leave WebView's callback before showing the Windows dialog.
                BeginInvoke(new Action(()=>{
                    try{
                        string name=Path.GetFileName(e.ResultFilePath);if(Program.Test!=null)name=System.Text.RegularExpressions.Regex.Replace(name,@" \(\d+\)(?=\.)","");
                        if(Program.Test!=null){
                            File.AppendAllText(Path.Combine(Program.Test,"downloads.txt"),name+"\n");
                            if(name.StartsWith("Cancel")){e.Cancel=true;report(false);}
                            else e.ResultFilePath=Path.Combine(Program.Test,name);
                            return;
                        }
                        using(var dialog=new SaveFileDialog()){
                            dialog.FileName=name;dialog.OverwritePrompt=true;dialog.AddExtension=true;
                            dialog.DefaultExt=Path.GetExtension(name).TrimStart('.');
                            if(dialog.ShowDialog(this)==DialogResult.OK)e.ResultFilePath=dialog.FileName;
                            else {e.Cancel=true;report(false);}
                        }
                    }catch(Exception error){
                        e.Cancel=true;report(false);
                        if(Program.Test!=null)Finish("FAIL: "+error.Message);
                        else MessageBox.Show(this,"The file could not be saved.\n\n"+error.Message,Text);
                    }finally{deferral.Complete();}
                }));
            };
            core.ProcessFailed+=(s,e)=>{if(Program.Test!=null)Finish("FAIL: WebView2 process stopped");};
            core.NavigationCompleted+=async(s,e)=>{
                if(!e.IsSuccess){if(Program.Test!=null)Finish("FAIL: Navigation "+e.WebErrorStatus);return;}
                ready=true;
                if(Program.Test!=null&&JagoSuiteBootstrap.TestRoot(Environment.GetCommandLineArgs())==null&&!testing){testing=true;await CheckApp();}
            };
            await core.AddScriptToExecuteOnDocumentCreatedAsync("window.jagoNative=true;");new JagoSuiteHost("repeat",this,core);
            core.Navigate("https://jagorepeat.example/index.html");
        }catch(Exception e){if(Program.Test!=null)Finish("FAIL: "+e);else MessageBox.Show(this,"Please install Microsoft WebView2 Runtime or use the included HTML app.\n\n"+e.Message,Text);}
    }
    async Task CheckApp(){try{
        for(int i=0;i<160;i++){if(await browser.CoreWebView2.ExecuteScriptAsync("assets.length>0 && !!window.jagoHistory")=="true")break;await Task.Delay(250);}
        string result=await browser.CoreWebView2.ExecuteScriptAsync(File.ReadAllText(Path.Combine(Program.Test,"probe.js")));
        File.WriteAllText(Path.Combine(Program.Test,"startup.json"),result);
        for(int i=0;i<600;i++){result=await browser.CoreWebView2.ExecuteScriptAsync("window.nativeProbe");if(result!="\"running\"")break;await Task.Delay(100);}
        File.WriteAllText(Path.Combine(Program.Test,"codecs.json"),await browser.CoreWebView2.ExecuteScriptAsync("window.loopCodecResult"));
        if(result!="\"PASS\"")throw new Exception(result);
        using(var shot=File.Create(Path.Combine(Program.Test,"preview.png")))await browser.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,shot);
        for(int i=0;i<100;i++){if(File.Exists(Path.Combine(Program.Test,"jago-repeat-tile-1024x1024.png")))break;await Task.Delay(100);}
        using(var image=Image.FromFile(Path.Combine(Program.Test,"jago-repeat-tile-1024x1024.png")))if(image.Width!=1024||image.Height!=1024)throw new Exception("Export dimensions incorrect");
        foreach(string panel in new[]{"arrange","edit","canvas","export"}){
            await browser.CoreWebView2.ExecuteScriptAsync("openToolPanel('"+panel+"');$('toast').style.display='none';");await Task.Delay(200);
            using(var shot=File.Create(Path.Combine(Program.Test,panel+".png")))await browser.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,shot);
        }
        await browser.CoreWebView2.ExecuteScriptAsync("$('mode').value='pattern';$('layout').value='symmetryXY';$('cols').value=$('rows').value=1;$('ox').value=$('oy').value=50;selectedItem=placements()[0].id;$('showRelations').checked=true;openToolPanel('edit');$('toast').style.display='none';");
        using(var shot=File.Create(Path.Combine(Program.Test,"connections.png")))await browser.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,shot);
        await browser.CoreWebView2.ExecuteScriptAsync("$('mode').value='texture';$('tool').value='stamp';$('stampType').value='text';$('stampText').value='JAGO';$('stampWidth').value=260;$('stampHeight').value=120;$('stampFont').value=72;openToolPanel('edit');$('toast').style.display='none';");
        using(var shot=File.Create(Path.Combine(Program.Test,"texture-tools.png")))await browser.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,shot);
        Finish("PASS: startup, high fidelity rendering, linked mirrors, undo/redo, spacing, feeds, wrapped texture painting and native PNG download.");
    }catch(Exception e){Finish("FAIL: "+e);}}
    void Finish(string text){File.WriteAllText(Path.Combine(Program.Test,"result.txt"),text);closing=true;Close();}
}

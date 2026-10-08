// ============================================================
//  GormitiLauncher.cs : app desktop per Windows.
//  Una finestra WinForms con dentro WebView2 (il motore di Edge)
//  che carica il gioco dalla cartella "game" accanto all'eseguibile.
//  I file sono serviti da un host virtuale https://gormiti.local,
//  così salvataggi e service worker funzionano come sul web.
//  Compilato da build.ps1 con il csc.exe incluso in Windows (C# 5).
// ============================================================
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: System.Reflection.AssemblyTitle("GORMITI - Le Pietre di Gorm")]
[assembly: System.Reflection.AssemblyProduct("GORMITI - Le Pietre di Gorm")]
[assembly: System.Reflection.AssemblyDescription("Roguelike fan-made a tema Gormiti")]
[assembly: System.Reflection.AssemblyVersion("1.1.0.0")]

namespace Gormiti
{
    public class GameWindow : Form
    {
        const string Host = "gormiti.local";
        const string RuntimeUrl = "https://go.microsoft.com/fwlink/p/?LinkId=2124703";
        readonly WebView2 web;
        readonly string gameDir;
        readonly bool dev;
        FormWindowState prevState = FormWindowState.Maximized;
        bool fullscreen;

        public GameWindow(string gameDir, bool dev)
        {
            this.gameDir = gameDir;
            this.dev = dev;
            Text = "GORMITI — Le Pietre di Gorm";
            BackColor = Color.FromArgb(5, 4, 10);
            ClientSize = new Size(1600, 900);
            MinimumSize = new Size(960, 600);
            StartPosition = FormStartPosition.CenterScreen;
            WindowState = FormWindowState.Maximized;
            try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch (Exception) { }

            web = new WebView2();
            web.Dock = DockStyle.Fill;
            web.DefaultBackgroundColor = Color.FromArgb(5, 4, 10);
            Controls.Add(web);
            Load += OnLoad;
        }

        async void OnLoad(object sender, EventArgs e)
        {
            try
            {
                string data = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GormitiPietreDiGorm");
                Directory.CreateDirectory(data);
                var opts = new CoreWebView2EnvironmentOptions("--autoplay-policy=no-user-gesture-required");
                var env = await CoreWebView2Environment.CreateAsync(null, data, opts);
                await web.EnsureCoreWebView2Async(env);
            }
            catch (WebView2RuntimeNotFoundException)
            {
                var r = MessageBox.Show(this,
                    "Per giocare serve il componente Microsoft Edge WebView2 Runtime, che non risulta installato.\n\n" +
                    "Sì = apri la pagina di download ufficiale Microsoft\nNo = gioca subito nel browser predefinito",
                    "GORMITI", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
                if (r == DialogResult.Yes) OpenExternal(RuntimeUrl);
                else if (r == DialogResult.No) OpenExternal(Path.Combine(gameDir, "index.html"));
                Close();
                return;
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, "Impossibile avviare il motore del gioco:\n" + ex.Message, "GORMITI", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
                return;
            }

            var core = web.CoreWebView2;
            var s = core.Settings;
            s.AreDevToolsEnabled = dev;
            s.AreDefaultContextMenusEnabled = dev;
            s.IsStatusBarEnabled = false;
            s.IsZoomControlEnabled = false;
            s.IsPinchZoomEnabled = false;
            s.IsSwipeNavigationEnabled = false;
            s.AreBrowserAcceleratorKeysEnabled = dev;
            s.IsGeneralAutofillEnabled = false;
            s.IsPasswordAutosaveEnabled = false;
            core.SetVirtualHostNameToFolderMapping(Host, gameDir, CoreWebView2HostResourceAccessKind.Allow);
            // lo schermo intero chiesto dalla pagina (F11 o opzione del gioco) diventa una finestra senza bordi
            core.ContainsFullScreenElementChanged += (o, a) => SetFullscreen(core.ContainsFullScreenElement);
            // i link esterni si aprono nel browser predefinito
            core.NewWindowRequested += (o, a) => { a.Handled = true; OpenExternal(a.Uri); };
            core.NavigationStarting += (o, a) =>
            {
                Uri u;
                if (Uri.TryCreate(a.Uri, UriKind.Absolute, out u) && u.Host != Host && (u.Scheme == "http" || u.Scheme == "https"))
                { a.Cancel = true; OpenExternal(a.Uri); }
            };
            core.DocumentTitleChanged += (o, a) => { if (!string.IsNullOrEmpty(core.DocumentTitle)) Text = core.DocumentTitle; };
            core.Navigate("https://" + Host + "/index.html");
        }

        void SetFullscreen(bool on)
        {
            if (on == fullscreen) return;
            fullscreen = on;
            if (on)
            {
                prevState = WindowState;
                FormBorderStyle = FormBorderStyle.None;
                WindowState = FormWindowState.Normal;
                WindowState = FormWindowState.Maximized;
            }
            else
            {
                FormBorderStyle = FormBorderStyle.Sizable;
                WindowState = prevState;
            }
        }

        static void OpenExternal(string target)
        {
            try { Process.Start(new ProcessStartInfo(target) { UseShellExecute = true }); } catch (Exception) { }
        }

        static string FindGame(string[] args)
        {
            for (int i = 0; i + 1 < args.Length; i++)
                if (args[i] == "--game" && File.Exists(Path.Combine(args[i + 1], "index.html"))) return Path.GetFullPath(args[i + 1]);
            string dir = AppDomain.CurrentDomain.BaseDirectory;
            string g = Path.Combine(dir, "game");
            if (File.Exists(Path.Combine(g, "index.html"))) return g;
            // avvio dalla cartella del progetto (sviluppo): risale fino a index.html
            var d = new DirectoryInfo(dir);
            while (d != null)
            {
                if (File.Exists(Path.Combine(d.FullName, "index.html")) && Directory.Exists(Path.Combine(d.FullName, "js"))) return d.FullName;
                d = d.Parent;
            }
            return null;
        }

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            string game = FindGame(args);
            if (game == null)
            {
                MessageBox.Show("Non trovo i file del gioco (cartella \"game\" accanto a Gormiti.exe).", "GORMITI", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }
            bool dev = Array.IndexOf(args, "--dev") >= 0;
            Application.Run(new GameWindow(game, dev));
        }
    }
}

package com.calcoslp.auto;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.*;

public class MainActivity extends Activity {

    int bg = Color.rgb(12, 14, 18);
    int card = Color.rgb(22, 25, 31);
    int card2 = Color.rgb(28, 32, 39);
    int text = Color.rgb(245, 247, 250);
    int muted = Color.rgb(155, 163, 175);
    int accent = Color.rgb(255, 92, 56);

    LinearLayout root;
    LinearLayout content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(bg);

        ScrollView scroll = new ScrollView(this);
        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(32, 36, 32, 40);

        scroll.addView(content);
        root.addView(scroll, new LinearLayout.LayoutParams(
                -1, 0, 1
        ));

        setContentView(root);

        buildHome();
    }

    TextView title(String value, float size) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextColor(text);
        t.setTextSize(size);
        t.setTypeface(null, 1);
        return t;
    }

    TextView label(String value) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextColor(muted);
        t.setTextSize(13);
        return t;
    }

    GradientDrawable bgDrawable(int color, float radius) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(radius);
        return g;
    }

    TextView card(String icon, String name, String description) {

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(24, 22, 24, 22);
        box.setBackground(bgDrawable(card, 28));

        TextView i = title(icon, 25);
        box.addView(i);

        TextView n = title(name, 17);
        n.setPadding(0, 12, 0, 4);
        box.addView(n);

        TextView d = label(description);
        box.addView(d);

        LinearLayout.LayoutParams lp =
                new LinearLayout.LayoutParams(0, -2, 1);
        lp.setMargins(0, 0, 12, 0);
        box.setLayoutParams(lp);

        return wrapCard(box);
    }

    TextView wrapCard(View view) {
        FrameLayout frame = new FrameLayout(this);
        frame.addView(view);
        return new TextView(this);
    }

    Button actionButton(String textValue) {

        Button b = new Button(this);
        b.setText(textValue);
        b.setTextColor(Color.WHITE);
        b.setTextSize(14);
        b.setAllCaps(false);
        b.setGravity(Gravity.CENTER);
        b.setBackground(bgDrawable(accent, 22));

        LinearLayout.LayoutParams lp =
                new LinearLayout.LayoutParams(-1, 58);
        lp.setMargins(0, 10, 0, 10);
        b.setLayoutParams(lp);

        return b;
    }

    void buildHome() {

        content.removeAllViews();

        TextView small = label("CALCOS LP");
        content.addView(small);

        TextView appTitle = title("AUTO", 34);
        appTitle.setPadding(0, 0, 0, 2);
        content.addView(appTitle);

        TextView subtitle =
                label("Producción inteligente de planchas");
        subtitle.setTextSize(15);
        content.addView(subtitle);

        Space s1 = new Space(this);
        content.addView(s1,
                new LinearLayout.LayoutParams(1, 30));

        Button newProject =
                actionButton("＋  NUEVA PLANCHA");

        newProject.setOnClickListener(v -> buildEditor());

        content.addView(newProject);

        TextView projects = title("MIS PROYECTOS", 18);
        projects.setPadding(0, 30, 0, 12);
        content.addView(projects);

        addProject("Plancha Gamer #04",
                "12 calcos · 1000 × 500 mm",
                "86% aprovechamiento");

        addProject("Tuning Octubre",
                "18 calcos · 1000 × 500 mm",
                "91% aprovechamiento");

        addProject("Fútbol",
                "24 calcos · 1000 × 500 mm",
                "88% aprovechamiento");

        TextView categories = title("CATEGORÍAS", 18);
        categories.setPadding(0, 30, 0, 12);
        content.addView(categories);

        addCategory("🎮", "Gamer",
                "Diseños gamer y joysticks");

        addCategory("🏎", "Tuning",
                "Autos, motores y estilo");

        addCategory("⚽", "Fútbol",
                "Clubes, escudos y pasión");

        addCategory("🔥", "Barrial",
                "Diseños urbanos argentinos");

        addCategory("📁", "Otros",
                "Todos los demás diseños");

        TextView settings = title("CONFIGURACIÓN", 18);
        settings.setPadding(0, 30, 0, 12);
        content.addView(settings);

        Button config = actionButton("⚙  Configuración avanzada");
        config.setBackground(bgDrawable(card2, 22));
        config.setOnClickListener(v -> buildSettings());
        content.addView(config);
    }

    void addProject(String name, String info, String efficiency) {

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(22, 18, 22, 18);
        box.setBackground(bgDrawable(card, 24));

        TextView n = title(name, 16);
        box.addView(n);

        TextView i = label(info);
        i.setPadding(0, 5, 0, 2);
        box.addView(i);

        TextView e = label(efficiency);
        e.setTextColor(Color.rgb(110, 210, 145));
        box.addView(e);

        LinearLayout.LayoutParams lp =
                new LinearLayout.LayoutParams(-1, -2);
        lp.setMargins(0, 0, 0, 10);

        content.addView(box, lp);
    }

    void addCategory(String icon, String name, String description) {

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.HORIZONTAL);
        box.setGravity(Gravity.CENTER_VERTICAL);
        box.setPadding(20, 18, 20, 18);
        box.setBackground(bgDrawable(card, 24));

        TextView ico = title(icon, 25);
        box.addView(ico,
                new LinearLayout.LayoutParams(55, 55));

        LinearLayout info = new LinearLayout(this);
        info.setOrientation(LinearLayout.VERTICAL);

        TextView n = title(name, 16);
        info.addView(n);

        TextView d = label(description);
        d.setPadding(0, 4, 0, 0);
        info.addView(d);

        box.addView(info);

        LinearLayout.LayoutParams lp =
                new LinearLayout.LayoutParams(-1, -2);
        lp.setMargins(0, 0, 0, 10);

        content.addView(box, lp);
    }

    void buildEditor() {

        content.removeAllViews();

        TextView back = label("‹  VOLVER");
        back.setTextSize(15);
        back.setOnClickListener(v -> buildHome());
        content.addView(back);

        TextView h = title("NUEVA PLANCHA", 28);
        h.setPadding(0, 20, 0, 4);
        content.addView(h);

        content.addView(label(
                "Prepará tu plancha y acomodá automáticamente tus diseños."
        ));

        Space space = new Space(this);
        content.addView(space,
                new LinearLayout.LayoutParams(1, 25));

        Button importButton =
                actionButton("＋  IMPORTAR PNG");

        importButton.setOnClickListener(v -> openFilePicker());

        content.addView(importButton);

        TextView previewTitle = title("VISTA PREVIA", 18);
        previewTitle.setPadding(0, 28, 0, 12);
        content.addView(previewTitle);

        LinearLayout preview = new LinearLayout(this);
        preview.setGravity(Gravity.CENTER);
        preview.setPadding(15, 20, 15, 20);
        preview.setBackground(bgDrawable(
                Color.rgb(35, 38, 44), 28
        ));

        TextView sheet = title(
                "PLANCHA\n\n" +
                "1000 × 500 mm\n\n" +
                "Aquí aparecerán tus diseños",
                16
        );
        sheet.setGravity(Gravity.CENTER);
        sheet.setPadding(25, 35, 25, 35);
        sheet.setTextColor(Color.WHITE);
        sheet.setBackground(bgDrawable(
                Color.rgb(245, 245, 242), 8
        ));

        preview.addView(sheet,
                new LinearLayout.LayoutParams(-1, 260));

        content.addView(preview);

        TextView tools = title("CONFIGURACIÓN RÁPIDA", 18);
        tools.setPadding(0, 28, 0, 12);
        content.addView(tools);

        addSetting("Ancho de plancha", "1000 mm");
        addSetting("Alto de plancha", "500 mm");
        addSetting("Separación", "5 mm");
        addSetting("Offset de corte", "2 mm");

        Button optimize = actionButton("✦  OPTIMIZAR PLANCHA");
        optimize.setBackground(bgDrawable(card2, 22));
        content.addView(optimize);

        Button export = actionButton("✂  EXPORTAR SVG");
        content.addView(export);
    }

    void addSetting(String name, String value) {

        LinearLayout row = new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(20, 17, 20, 17);
        row.setBackground(bgDrawable(card, 20));

        TextView n = label(name);
        n.setTextSize(14);

        TextView val = title(value, 14);

        row.addView(n,
                new LinearLayout.LayoutParams(
                        0, -2, 1
                ));

        row.addView(val);

        LinearLayout.LayoutParams lp =
                new LinearLayout.LayoutParams(-1, -2);
        lp.setMargins(0, 0, 0, 8);

        content.addView(row, lp);
    }

    void buildSettings() {

        content.removeAllViews();

        TextView back = label("‹  VOLVER");
        back.setOnClickListener(v -> buildHome());
        content.addView(back);

        TextView h = title("CONFIGURACIÓN", 28);
        h.setPadding(0, 20, 0, 5);
        content.addView(h);

        content.addView(label(
                "Todos los parámetros de producción en un solo lugar."
        ));

        addSetting("Ancho predeterminado", "1000 mm");
        addSetting("Alto predeterminado", "500 mm");
        addSetting("Offset de corte", "2 mm");
        addSetting("Separación mínima", "5 mm");
        addSetting("Rotación automática", "Activada");
        addSetting("Optimización", "Máxima");

        Button save = actionButton("✓  GUARDAR CONFIGURACIÓN");
        content.addView(save);
    }

    void openFilePicker() {

        android.content.Intent intent =
                new android.content.Intent(
                        android.content.Intent.ACTION_OPEN_DOCUMENT
                );

        intent.setType("image/png");
        intent.putExtra(
                android.content.Intent.EXTRA_ALLOW_MULTIPLE,
                true
        );

        intent.addCategory(
                android.content.Intent.CATEGORY_OPENABLE
        );

        startActivityForResult(intent, 100);
    }
                                      }

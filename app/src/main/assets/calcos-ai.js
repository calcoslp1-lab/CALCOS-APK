/* ============================================================
   CALCOS LP AUTO
   CALCOS AI ENGINE v1
   Motor inteligente de análisis, preflight y optimización
   ============================================================ */

(function () {
    "use strict";

    const AI = {

        version: "1.0",

        config: {
            defaultSheetWidth: 1000,
            defaultSheetHeight: 500,
            defaultSeparation: 5,
            defaultCutOffset: 2
        },

        state: {
            busy: false,
            lastReport: null,
            history: []
        },

        /* -------------------------------------------------------
           UTILIDADES
        ------------------------------------------------------- */

        clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        number(value, fallback = 0) {
            const n = Number(value);
            return Number.isFinite(n) ? n : fallback;
        },

        mm(value) {
            return Math.round(value * 100) / 100;
        },

        /* -------------------------------------------------------
           OBTENER ESTADO DEL EDITOR EXISTENTE
           ------------------------------------------------------- */

        getEditorState() {

            /*
             * Intentamos detectar automáticamente el estado
             * utilizado por el editor actual.
             */

            const candidates = [
                window.state,
                window.appState,
                window.editorState,
                window.CALCOS_STATE
            ];

            let state = candidates.find(
                s => s && typeof s === "object"
            );

            if (!state) {
                state = {};
            }

            return state;
        },

        getObjects() {

            const state = this.getEditorState();

            const candidates = [
                state.objects,
                state.items,
                state.designs,
                state.stickers,
                window.objects,
                window.items
            ];

            const objects = candidates.find(
                arr => Array.isArray(arr)
            );

            return objects || [];
        },

        getSheet() {

            const state = this.getEditorState();

            return {
                width: this.number(
                    state.sheetWidth ||
                    state.sheet?.width ||
                    window.sheetWidth,
                    this.config.defaultSheetWidth
                ),

                height: this.number(
                    state.sheetHeight ||
                    state.sheet?.height ||
                    window.sheetHeight,
                    this.config.defaultSheetHeight
                ),

                separation: this.number(
                    state.separation ||
                    state.sheet?.separation,
                    this.config.defaultSeparation
                ),

                cutOffset: this.number(
                    state.cutOffset ||
                    state.sheet?.cutOffset,
                    this.config.defaultCutOffset
                )
            };
        },

        /* -------------------------------------------------------
           ANÁLISIS DE OBJETOS
           ------------------------------------------------------- */

        analyzeObject(object, index) {

            const width = this.number(
                object.width ||
                object.w ||
                object.displayWidth,
                0
            );

            const height = this.number(
                object.height ||
                object.h ||
                object.displayHeight,
                0
            );

            const x = this.number(object.x, 0);
            const y = this.number(object.y, 0);

            const rotation = this.number(
                object.rotation ||
                object.angle,
                0
            );

            const issues = [];
            const warnings = [];

            if (width <= 0 || height <= 0) {
                issues.push("Tamaño inválido");
            }

            if (width > 1000 || height > 1000) {
                warnings.push("Diseño extremadamente grande");
            }

            if (width < 5 || height < 5) {
                warnings.push("Diseño muy pequeño");
            }

            return {
                index,
                name:
                    object.name ||
                    object.title ||
                    `Diseño ${index + 1}`,

                width: this.mm(width),
                height: this.mm(height),

                x: this.mm(x),
                y: this.mm(y),

                rotation: this.mm(rotation),

                area: this.mm(width * height),

                issues,
                warnings,

                score:
                    issues.length
                        ? 0
                        : warnings.length
                            ? 70
                            : 100
            };
        },

        /* -------------------------------------------------------
           PRE-FLIGHT
           ------------------------------------------------------- */

        preflight() {

            const objects = this.getObjects();
            const sheet = this.getSheet();

            const analyzed = objects.map(
                (obj, index) =>
                    this.analyzeObject(obj, index)
            );

            const problems = [];
            const warnings = [];

            analyzed.forEach(item => {

                item.issues.forEach(issue => {
                    problems.push({
                        design: item.name,
                        message: issue
                    });
                });

                item.warnings.forEach(warning => {
                    warnings.push({
                        design: item.name,
                        message: warning
                    });
                });

                if (
                    item.x < 0 ||
                    item.y < 0 ||
                    item.x + item.width > sheet.width ||
                    item.y + item.height > sheet.height
                ) {
                    problems.push({
                        design: item.name,
                        message: "El diseño sale de la plancha"
                    });
                }
            });

            const totalArea = analyzed.reduce(
                (sum, item) =>
                    sum + item.area,
                0
            );

            const sheetArea =
                sheet.width *
                sheet.height;

            const utilization =
                sheetArea > 0
                    ? (totalArea / sheetArea) * 100
                    : 0;

            const waste =
                Math.max(
                    0,
                    100 - utilization
                );

            const report = {
                ok: problems.length === 0,

                sheet,

                designs: analyzed,

                totalDesigns: analyzed.length,

                totalArea: this.mm(totalArea),

                utilization: this.mm(
                    this.clamp(
                        utilization,
                        0,
                        100
                    )
                ),

                waste: this.mm(waste),

                problems,

                warnings,

                generatedAt:
                    new Date().toISOString()
            };

            this.state.lastReport = report;

            return report;
        },

        /* -------------------------------------------------------
           OPTIMIZADOR DE PLANCHA
           ------------------------------------------------------- */

        optimize() {

            const objects = this.getObjects();
            const sheet = this.getSheet();

            if (!objects.length) {
                return {
                    success: false,
                    message:
                        "No hay diseños cargados."
                };
            }

            /*
             * Ordenamos primero los diseños grandes.
             * Esto evita dejar huecos difíciles de utilizar.
             */

            const sorted =
                [...objects].sort(
                    (a, b) => {

                        const areaA =
                            this.number(a.width || a.w) *
                            this.number(a.height || a.h);

                        const areaB =
                            this.number(b.width || b.w) *
                            this.number(b.height || b.h);

                        return areaB - areaA;
                    }
                );

            let cursorX = 0;
            let cursorY = 0;
            let rowHeight = 0;

            sorted.forEach(object => {

                let width =
                    this.number(
                        object.width ||
                        object.w
                    );

                let height =
                    this.number(
                        object.height ||
                        object.h
                    );

                /*
                 * Intentamos rotar si así entra mejor.
                 */

                if (
                    cursorX + width > sheet.width &&
                    cursorX + height <= sheet.width
                ) {
                    const temp = width;
                    width = height;
                    height = temp;

                    object.rotation =
                        this.number(
                            object.rotation
                        ) + 90;
                }

                /*
                 * Nueva fila.
                 */

                if (
                    cursorX + width >
                    sheet.width
                ) {

                    cursorX = 0;

                    cursorY +=
                        rowHeight +
                        sheet.separation;

                    rowHeight = 0;
                }

                /*
                 * Posición.
                 */

                object.x = cursorX;
                object.y = cursorY;

                cursorX +=
                    width +
                    sheet.separation;

                rowHeight =
                    Math.max(
                        rowHeight,
                        height
                    );
            });

            /*
             * Intentamos avisar al editor
             * para que vuelva a dibujar.
             */

            this.refreshEditor();

            return {
                success: true,
                message:
                    "Plancha optimizada.",
                objects: sorted
            };
        },

        /* -------------------------------------------------------
           CALIFICACIÓN INTELIGENTE
           ------------------------------------------------------- */

        getProductionScore(report) {

            if (!report) {
                report = this.preflight();
            }

            let score = 100;

            score -=
                report.problems.length * 20;

            score -=
                report.warnings.length * 5;

            /*
             * Premia un buen aprovechamiento.
             */

            if (report.utilization >= 85) {
                score += 5;
            }

            if (report.utilization >= 95) {
                score += 5;
            }

            return this.clamp(
                Math.round(score),
                0,
                100
            );
        },

        /* -------------------------------------------------------
           ASISTENTE DE TEXTO
           ------------------------------------------------------- */

        command(text) {

            const input =
                String(text || "")
                    .toLowerCase()
                    .trim();

            if (!input) {
                return {
                    message:
                        "Decime qué querés hacer."
                };
            }

            /*
             * OPTIMIZAR
             */

            if (
                input.includes("optim") ||
                input.includes("acomod") ||
                input.includes("orden")
            ) {

                const result =
                    this.optimize();

                return {
                    action: "optimize",
                    message:
                        result.message
                };
            }

            /*
             * ANALIZAR
             */

            if (
                input.includes("analiz") ||
                input.includes("revis") ||
                input.includes("problema") ||
                input.includes("preflight")
            ) {

                const report =
                    this.preflight();

                return {
                    action: "preflight",
                    report,
                    message:
                        report.ok
                            ? "La plancha pasó el control."
                            : `Encontré ${report.problems.length} problema(s).`
                };
            }

            /*
             * DESPERDICIO
             */

            if (
                input.includes("desperd") ||
                input.includes("aprovech")
            ) {

                const report =
                    this.preflight();

                return {
                    action: "stats",
                    utilization:
                        report.utilization,
                    waste:
                        report.waste,

                    message:
                        `Aprovechamiento: ${report.utilization}%. Desperdicio: ${report.waste}%.`
                };
            }

            /*
             * AYUDA
             */

            return {
                message:
                    "Puedo analizar la plancha, detectar problemas, calcular desperdicio y optimizar automáticamente la distribución."
            };
        },

        /* -------------------------------------------------------
           REFRESCAR EDITOR
           ------------------------------------------------------- */

        refreshEditor() {

            const functions = [
                "render",
                "renderCanvas",
                "renderAll",
                "drawCanvas",
                "updateCanvas",
                "refresh"
            ];

            for (const name of functions) {

                if (
                    typeof window[name] ===
                    "function"
                ) {

                    try {
                        window[name]();
                        return;
                    } catch (e) {}
                }
            }

            /*
             * Último recurso:
             * disparar eventos comunes.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "calcos-ai-updated"
                )
            );
        },

        /* -------------------------------------------------------
           PANEL UI
           ------------------------------------------------------- */

        openPanel() {

            let panel =
                document.getElementById(
                    "calcos-ai-panel"
                );

            if (!panel) {
                panel =
                    this.createPanel();
            }

            panel.classList.add("open");

            this.updatePanel();
        },

        closePanel() {

            const panel =
                document.getElementById(
                    "calcos-ai-panel"
                );

            if (panel) {
                panel.classList.remove("open");
            }
        },

        createPanel() {

            const panel =
                document.createElement("div");

            panel.id =
                "calcos-ai-panel";

            panel.innerHTML = `
                <div class="ai-header">
                    <div>
                        <div class="ai-badge">✦ AI</div>
                        <div class="ai-title">
                            CALCOS AI
                        </div>
                        <div class="ai-subtitle">
                            Asistente de producción
                        </div>
                    </div>

                    <button
                        class="ai-close"
                        id="calcos-ai-close">
                        ×
                    </button>
                </div>

                <div class="ai-content">

                    <div
                        class="ai-score-card"
                        id="calcos-ai-score">
                        <span>Puntuación</span>
                        <strong>—</strong>
                    </div>

                    <button
                        class="ai-main-button"
                        id="calcos-ai-optimize">
                        ✦ Optimizar plancha
                    </button>

                    <button
                        class="ai-secondary-button"
                        id="calcos-ai-analyze">
                        ✓ Analizar producción
                    </button>

                    <div
                        class="ai-stats"
                        id="calcos-ai-stats">
                    </div>

                    <div
                        class="ai-chat"
                        id="calcos-ai-chat">

                        <div class="ai-message">
                            Soy CALCOS AI.<br>
                            Decime qué querés hacer
                            con la plancha.
                        </div>

                    </div>

                    <div class="ai-input-row">

                        <input
                            id="calcos-ai-input"
                            placeholder="Ej: optimizá la plancha..."
                        />

                        <button
                            id="calcos-ai-send">
                            ➤
                        </button>

                    </div>

                </div>
            `;

            document.body.appendChild(panel);

            document
                .getElementById(
                    "calcos-ai-close"
                )
                .onclick = () =>
                    this.closePanel();

            document
                .getElementById(
                    "calcos-ai-optimize"
                )
                .onclick = () => {

                    const result =
                        this.command(
                            "optimizar plancha"
                        );

                    this.addChat(
                        result.message
                    );

                    this.updatePanel();
                };

            document
                .getElementById(
                    "calcos-ai-analyze"
                )
                .onclick = () => {

                    const result =
                        this.command(
                            "analizar producción"
                        );

                    this.addChat(
                        result.message
                    );

                    this.updatePanel();
                };

            const input =
                document.getElementById(
                    "calcos-ai-input"
                );

            document
                .getElementById(
                    "calcos-ai-send"
                )
                .onclick = () =>
                    this.sendCommand();

            input.addEventListener(
                "keydown",
                event => {

                    if (
                   

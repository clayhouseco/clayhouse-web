# Plantilla: proyecto nuevo para la galería

Copia este archivo a `_inbox/proyectos/{slug}/info.md` y llénalo.

> Los proyectos aparecen en **`/proyectos`** (galería filtrable) y dentro de la ficha del producto que se usó. Si el proyecto usa varios productos Clay House, lo asociaré al principal y mencionaré los otros.

---

## Datos básicos

- **Nombre del proyecto**: <!-- ej. "Casa Finca Llanogrande" -->
- **Slug** (kebab-case para la carpeta): <!-- ej. "casa-finca-llanogrande" -->
- **Producto Clay House principal**: <!-- ej. "Ladrillo Romano Matizado" — debe ser uno del catálogo -->
- **Otros productos usados** (opcional): <!-- ej. "Enchape Romano Natural, Piso 30x30" -->
- **Tipo de obra**: <!-- Residencial | Comercial | Patrimonial | Hospitalidad | Institucional | Otro -->

## Ubicación y fecha

- **Ciudad**: <!-- ej. "Llanogrande, Rionegro" -->
- **Departamento / País**: <!-- ej. "Antioquia, Colombia" -->
- **Año de finalización**: 
- **Arquitecto / Estudio** (opcional): 

## Descripción (1-2 líneas, opcional)

<!-- Una línea que cuente el reto o lo interesante del proyecto. Si no tienes, lo dejo vacío. -->

## ¿Mostrarlo como destacado?

- **¿Aparece en la home?**: <!-- sí / no — solo 3-4 proyectos van en la home -->

---

## Estructura de archivos a entregar

```
_inbox/proyectos/{slug}/
├── info.md                  ← este archivo, lleno
└── fotos/
    ├── 01-fachada.jpg       ← la primera foto será la portada
    ├── 02-detalle.jpg
    ├── 03-interior.jpg
    └── ...
```

**Cómo nombrar las fotos:**
- Prefijo numérico (`01-`, `02-`, `03-`) si quieres un orden específico.
- Sin tildes ni espacios en el nombre del archivo.
- Mínimo 1 foto, ideal 3-8 fotos.
- La **primera foto** (alfabéticamente) será la portada del proyecto en la galería.

**Tip:** Si tienes fotos verticales y horizontales, alterna entre ellas para que la galería se vea más dinámica.

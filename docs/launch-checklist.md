# Checklist de lanzamiento — clayhouse.com.co → Framer

## Pre-lanzamiento (semana 5)

### Contenido
- [ ] Home con los 8 bloques (`content/home.md`)
- [ ] 5+ productos cargados en CMS con imágenes
- [ ] Nosotros y Contacto publicados
- [ ] Descargas con PDFs reales subidos
- [ ] FAQs en página Contacto o acordeón
- [ ] Páginas legales: `/legal/privacidad`, `/legal/devoluciones`

### Diseño
- [ ] Colores del manual aplicados (`design-tokens.json`)
- [ ] Tipografía Montserrat Light + Helvetica Neue Bold
- [ ] Responsive probado: iPhone, iPad, desktop 1440px
- [ ] Video hero &lt; 5 MB o imagen poster optimizada

### Formularios
- [ ] Formulario envía a ventas@clayhouse.com.co
- [ ] Email de prueba recibido
- [ ] WhatsApp flotante funcional

### SEO
- [ ] Title y meta description en cada página
- [ ] Alt text en todas las imágenes
- [ ] Favicon y og:image (1200×630)
- [ ] Google Search Console verificado
- [ ] sitemap.xml accesible (automático Framer)

### Analytics
- [ ] Google Analytics 4 instalado (Framer → Custom Code head)
- [ ] O Plausible si prefieren privacidad

```html
<!-- GA4 ejemplo -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Migración DNS (día de lanzamiento)

1. En Framer: **Site Settings → Domains → Add** `clayhouse.com.co`
2. Framer mostrará registros DNS (A/CNAME). Copiarlos.
3. En el panel del registrador del dominio (donde compraron .com.co):
   - Actualizar registros según instrucciones Framer
   - TTL recomendado: 300 (5 min) durante migración
4. Esperar propagación (15 min – 48 h)
5. Activar **SSL** automático en Framer
6. Marcar sitio como **Production**

---

## Redirecciones 301

En Framer: **Site Settings → Redirects**

Importar manualmente desde `redirects.csv` (formato: path antiguo → path nuevo).

Prioridad alta:
- `/solicita-informacion-productos-servicios/` → `/contacto`
- `/tienda/` → `/productos`
- `/carrito-de-compras/` → `/contacto`
- Productos legacy → nuevos slugs en `/productos/`

---

## WordPress / Elementor (sitio viejo)

- [ ] Backup completo de WordPress antes de apagar
- [ ] Mantener hosting 30 días solo con redirects si Framer no cubre todas las URLs
- [ ] Desactivar indexación en WP si queda temporalmente online (`noindex`)

---

## Post-lanzamiento (semana 6–8)

- [ ] Probar 10 URLs del sitemap antiguo — deben redirigir o responder 200
- [ ] PageSpeed Insights móvil &gt; 80
- [ ] Enviar sitemap en Search Console
- [ ] Anuncio en redes + email a base de clientes/arquitectos
- [ ] Fase 2: sesión fotográfica y sustitución de placeholders

---

## Fase 2 (semanas 9–12)

- [ ] Publicar `/colores`, `/proyectos`, `/sostenibilidad`, `/historias`
- [ ] Completar `cms/projects.csv` con fotos y arquitectos reales
- [ ] Relanzamiento comunicación “nueva vitrina”

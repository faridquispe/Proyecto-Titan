/* ==========================================================================
   ECOS.JS — "Ecos del Silencio" dentro del juego 3D
   --------------------------------------------------------------------------
   Este archivo se carga DESPUÉS del código del juego 3D y le agrega:
     1. El RECEPTOR: al hablar con una máquina ya no sale un texto largo;
        primero sintonizas su eco, luego la escuchas y al final superas
        su desafío (pregunta o minijuego) para ARCHIVARLA.
     2. El ARCHIVO: un medidor arriba a la derecha con cuántos ecos llevas.
        Se guarda en el navegador.
     3. Historias propias para 12 máquinas de la NASA, 4 ecos del espacio
        profundo (NEAR, Dawn, Kepler, Pioneer 10) y 2 minijuegos:
        aterrizar como Surveyor 3 y medir la Luna con el láser del Apolo 15.
     4. Ajustes: EVE ya no se "enoja" (ahora da datos), los controles se
        esconden solos y hay un botón "?" para verlos.
   Usa cosas del juego original: SITES, siteStory, LUNA2_STORY, currentLang,
   i18n, triggerEveMessage, bgAudio, goToSite...
   ========================================================================== */
(function () {
'use strict';
const ES = () => currentLang !== 'en';
const tx = (es, en) => (ES() ? es : en);

/* ---------- 1. TEXTOS NUEVOS DEL JUEGO (español / inglés) ---------- */
Object.assign(i18n.es, {
  pageTitle: 'Ecos del Silencio 3D',
  startTitle: 'ECOS DEL SILENCIO',
  startDesc: 'Desde 1959 hemos dejado máquinas en la Luna, en Marte y en el espacio profundo. Vuela hasta ellas, sintoniza su eco y guarda su historia en el archivo.',
  startBtn: 'Empezar el vuelo',
  hudTitle: 'CONTROLES DE VUELO',
  eveChestTitle: 'Toca la pantalla de EVE para recibir un dato',
  eveWelcome: '¡Hola! Soy EVE. Abre el archivo (arriba a la derecha) o vuela hasta la Luna o Marte. Aterriza con F junto a una máquina y pulsa E para sintonizar su eco.',
  eveCalm: 'Aquí tienes un dato espacial: '
});
Object.assign(i18n.en, {
  pageTitle: 'Echoes of Silence 3D',
  startTitle: 'ECHOES OF SILENCE',
  startDesc: 'Since 1959 we have left machines on the Moon, on Mars and in deep space. Fly to them, tune in to their echo and save their story in the archive.',
  startBtn: 'Start flying',
  hudTitle: 'FLIGHT CONTROLS',
  eveChestTitle: "Tap EVE's screen for a space fact",
  eveWelcome: "Hi! I'm EVE. Open the archive (top right) or fly to the Moon or Mars. Land with F next to a machine and press E to tune in to its echo.",
  eveCalm: 'Here is a space fact: '
});
// Precisión: la "lluvia de diamantes" es una hipótesis, no algo observado.
i18n.es.spaceFacts = i18n.es.spaceFacts.map(f => f.startsWith('En Júpiter y Saturno') ? 'Los científicos creen que en Júpiter y Saturno podría llover diamante: la enorme presión convertiría el carbono del metano en cristales.' : f);
i18n.en.spaceFacts = i18n.en.spaceFacts.map(f => f.startsWith('In Jupiter and Saturn') ? 'Scientists think it may rain diamonds on Jupiter and Saturn: huge pressure could turn carbon from methane into crystals.' : f);

/* EVE: tocar su pantalla ahora da un dato (ya no se enoja) */
window.handleEveChestClick = function (e) {
  if (e) e.stopPropagation();
  const t = i18n[currentLang];
  triggerEveMessage(t.eveCalm + t.spaceFacts[factIndex]);
  factIndex = (factIndex + 1) % t.spaceFacts.length;
};

/* Título de la pantalla de inicio con dos colores */
const _setLanguage = window.setLanguage;
window.setLanguage = function (lang) {
  _setLanguage(lang);
  const h = document.getElementById('start-title');
  h.innerHTML = ES() ? 'Ecos del <em>Silencio</em>' : 'Echoes of <em>Silence</em>';
  const eb = document.getElementById('e-eyebrow');
  if (eb) eb.textContent = tx('NASA Space Apps · Equipos abandonados', 'NASA Space Apps · Discarded equipment');
  renderMeter(); if (document.getElementById('sites-panel').classList.contains('active')) buildSitesPanel();
  document.getElementById('e-help').title = tx('Ver u ocultar los controles', 'Show or hide the controls');
  if (typeof renderCieloItem === 'function') try { renderCieloItem(); } catch (e) {}
};

/* ---------- 2. HISTORIAS PROPIAS (datos de NASA / NSSDCA) ---------- */
// Clave = nombre del sitio en el juego 3D (SITES[i].n)
const CUSTOM = {
'Surveyor 3': {kind:'Sonda de aterrizaje · NASA, 1967',
 story:['Hola. Soy Surveyor 3. En 1967 nadie sabía si el suelo de la Luna aguantaría una nave. Algunos temían que fuera polvo profundo, como arena movediza.',
 'Mi trabajo era bajar suavemente y comprobarlo. Pero mis motores no se apagaron a tiempo y reboté dos veces antes de quedarme quieto.',
 'Con mi pala cavé zanjas y tomé miles de fotos. El suelo era firme: los humanos podían aterrizar.',
 'Dos años y medio después, dos astronautas del Apolo 12 vinieron a visitarme. Se llevaron mi cámara a la Tierra para estudiar cómo me había cambiado la Luna.'],
 facts:[['Lanzamiento','17 de abril de 1967'],['Aterrizaje','20 de abril de 1967, Océano de las Tormentas'],['Última señal','4 de mayo de 1967'],['Hoy','En la Luna, sin su cámara, a unos 180 m del lugar donde aterrizó el Apolo 12']],
 game:'landing', src:['NASA · Surveyor 3','https://science.nasa.gov/mission/surveyor-3/']},
'Apolo 11': {kind:'Etapa de descenso · NASA, 1969',
 story:['Soy la mitad de abajo del Eagle, el módulo lunar del Apolo 11. El 20 de julio de 1969 llevé a Neil Armstrong y Buzz Aldrin hasta el Mar de la Tranquilidad.',
 'En una de mis patas hay una placa: «Aquí, hombres del planeta Tierra pusieron pie por primera vez en la Luna. Julio de 1969 d. C. Vinimos en paz en nombre de toda la humanidad».',
 'Al día siguiente fui su plataforma de lanzamiento. La mitad de arriba despegó desde mi techo para volver con Michael Collins, que esperaba en órbita.',
 'Yo me quedé aquí. Cuando despegaron, el chorro del motor tumbó la bandera que habían clavado cerca. Desde entonces guardo el lugar.'],
 facts:[['Misión','Apolo 11'],['Aterrizaje','20 de julio de 1969, Mar de la Tranquilidad'],['Despegue de la etapa de ascenso','21 de julio de 1969'],['Hoy','La etapa de descenso sigue en la Base Tranquilidad']],
 quiz:{q:'¿Por qué se quedó en la Luna la etapa de descenso del Eagle?',o:['Sirvió de plataforma de lanzamiento para la etapa de ascenso','Se averió al aterrizar y no pudo despegar','La dejaron como refugio para futuros astronautas'],a:0,e:'El módulo lunar tenía dos partes. La de abajo hizo de plataforma y la de arriba despegó con los astronautas.'},
 src:['NSSDCA · Módulo lunar del Apolo 11','https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C']},
'Apolo 12': {kind:'Estación científica ALSEP · NASA, 1969',
 story:['Soy ALSEP, un conjunto de instrumentos que los astronautas del Apolo 12 dejaron en noviembre de 1969, muy cerca de Surveyor 3.',
 'Mi parte más sensible era un sismómetro. Escuchaba los temblores de la Luna, llamados lunamotos, y los golpes de meteoritos.',
 'Cuando la etapa de ascenso del módulo lunar se estrelló a propósito contra la Luna, la sentí vibrar casi una hora, como una campana. Su corteza seca y fracturada hacía rebotar las ondas.',
 'Trabajé casi ocho años, hasta que me apagaron desde la Tierra el 30 de septiembre de 1977.'],
 facts:[['Misión','Apolo 12'],['Instalado','19 de noviembre de 1969, Océano de las Tormentas'],['Instrumentos','Sismómetro, magnetómetro, detectores de viento solar y de la atmósfera lunar'],['Apagado','30 de septiembre de 1977']],
 quiz:{q:'¿Qué hizo vibrar la Luna «como una campana» durante casi una hora?',o:['Un terremoto en la Tierra','El choque intencional de la etapa de ascenso del módulo lunar','Los pasos de los astronautas'],a:1,e:'La NASA estrelló a propósito la etapa de ascenso para crear un temblor artificial y estudiar el interior de la Luna.'},
 src:['NSSDCA · ALSEP del Apolo 12','https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C']},
'Apolo 15': {kind:'Retrorreflector láser · NASA, 1971',
 story:['No tengo motor, ni batería, ni antena. Soy un panel con 300 prismas de vidrio que dejaron los astronautas del Apolo 15 en 1971, junto a su rover lunar.',
 'Y aun así sigo trabajando. Cuando un observatorio de la Tierra me dispara un láser, mis prismas devuelven la luz justo hacia donde vino.',
 'Midiendo cuánto tarda la luz en ir y volver, los científicos calculan la distancia a la Luna con precisión de milímetros.',
 'Así descubrieron que la Luna se aleja de la Tierra unos 3,8 cm cada año, más o menos lo que crecen tus uñas en ese tiempo.'],
 facts:[['Misión','Apolo 15'],['Instalado','Agosto de 1971, región Hadley-Apeninos'],['Estado','Activo: sigue reflejando láseres desde la Tierra'],['Compañeros','Retrorreflectores del Apolo 11 y 14, y otros en los rovers soviéticos Lunojod']],
 game:'laser', src:['NSSDCA · Vehículo lunar del Apolo 15','https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C']},
'Apolo 17': {kind:'Rover lunar · NASA, 1972',
 story:['Soy el vehículo lunar del Apolo 17: un coche eléctrico que viajó a la Luna doblado en un costado del módulo lunar.',
 'En diciembre de 1972 llevé a Gene Cernan y Harrison Schmitt por el valle Taurus-Littrow, casi 36 km en total. Gracias a mí pudieron ir lejos y recoger rocas de muchos lugares.',
 'Antes de irse me estacionaron a un lado. Mi cámara, manejada desde la Tierra, grabó su despegue.',
 'Fueron las últimas personas que caminaron en la Luna. Desde entonces, nadie ha vuelto a conducirme.'],
 facts:[['Misión','Apolo 17 (hay rovers también de los Apolo 15 y 16)'],['Llegada','11 de diciembre de 1972'],['Energía','Baterías de plata y zinc, no recargables'],['Hoy','Estacionado en el valle Taurus-Littrow']],
 quiz:{q:'¿Cómo llegó el rover hasta la Luna?',o:['En otro cohete, días antes que los astronautas','Doblado en un costado del módulo lunar','Los astronautas lo armaron con piezas sueltas'],a:1,e:'Iba plegado en el módulo lunar. Los astronautas tiraban de unas cintas y el rover se desplegaba.'},
 src:['NSSDCA · Vehículo lunar (LRV)','https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C']},
'Viking 1': {kind:'Módulo de aterrizaje · NASA, 1976',
 story:['Soy el módulo de aterrizaje Viking 1. El 20 de julio de 1976, siete años exactos después del Apolo 11, me posé en la llanura Chryse Planitia.',
 'Fui la primera nave de Estados Unidos en funcionar con éxito sobre Marte. Envié de las primeras fotos nítidas de su superficie: un desierto rojizo de rocas.',
 'Mi gran pregunta era: ¿hay vida en Marte? Con mi brazo recogí tierra y la probé en mis pequeños laboratorios. Los resultados fueron confusos y la mayoría de los científicos concluyó que no detecté vida.',
 'Trabajé más de seis años, hasta noviembre de 1982.'],
 facts:[['Lanzamiento','20 de agosto de 1975'],['Aterrizaje','20 de julio de 1976, Chryse Planitia'],['Última señal','Noviembre de 1982'],['Hoy','Inactivo en el lugar donde aterrizó']],
 quiz:{q:'¿Qué buscaban los experimentos de Viking 1 en el suelo de Marte?',o:['Oro y metales','Señales de vida microscópica','Restos de naves antiguas'],a:1,e:'Viking llevaba experimentos de biología. Los resultados se siguen discutiendo, pero no hubo una detección clara de vida.'},
 src:['NASA · Viking 1','https://science.nasa.gov/mission/viking-1/']},
'Mars Pathfinder y Sojourner': {kind:'Primer rover en Marte · NASA, 1997',
 story:['Soy Sojourner, el primer rover en otro planeta. Peso 10,6 kg, como un perro mediano. Llegué el 4 de julio de 1997 dentro del módulo Pathfinder, que rebotó sobre Marte envuelto en bolsas de aire.',
 'Mi nombre lo propuso Valerie Ambroise, una niña de 12 años, en un concurso. Homenajea a Sojourner Truth, que luchó contra la esclavitud y por los derechos de las mujeres.',
 'Me diseñaron para 7 días. Funcioné 83. Medí la química de rocas a las que el equipo llamó Barnacle Bill y Yogi.',
 'El 27 de septiembre de 1997 se perdió la conexión con Pathfinder y me quedé en silencio, a pocos metros de él.'],
 facts:[['Aterrizaje','4 de julio de 1997, Ares Vallis'],['Masa','10,6 kg'],['Duración','83 días (diseñado para 7)'],['Hoy','Estacionado cerca del módulo Pathfinder']],
 quiz:{q:'¿Quién propuso el nombre «Sojourner»?',o:['Un astronauta del Apolo','Una niña de 12 años, en un concurso','El presidente de Estados Unidos'],a:1,e:'Valerie Ambroise ganó el concurso con un ensayo sobre Sojourner Truth.'},
 src:['NASA · Mars Pathfinder','https://science.nasa.gov/mission/mars-pathfinder/']},
'Spirit': {kind:'Rover · NASA, 2004',
 story:['Soy Spirit. Llegué al cráter Gusev el 4 de enero de 2004. Mi misión debía durar 90 días marcianos. Trabajé más de seis años.',
 'Una de mis ruedas se estropeó y tuve que andar marcha atrás, arrastrándola. Esa rueda rota raspó el suelo y dejó ver algo blanco.',
 'Era sílice casi pura: una pista de que hace mucho tiempo hubo agua caliente, como en fuentes termales o chimeneas de vapor.',
 'En 2009 quedé atrapado en arena blanda. Seguí estudiando desde ahí hasta que el invierno me dejó sin energía. Mi última señal llegó el 22 de marzo de 2010.'],
 facts:[['Aterrizaje','4 de enero de 2004, cráter Gusev'],['Recorrido','7,7 km'],['Última señal','22 de marzo de 2010'],['Hoy','Atascado en el lugar llamado Troy']],
 quiz:{q:'¿Cómo descubrió Spirit la sílice que indica agua caliente antigua?',o:['La encontró con un taladro gigante','Su rueda rota raspó el suelo al arrastrarla','Un meteorito la desenterró delante de él'],a:1,e:'Un problema se convirtió en descubrimiento: la rueda averiada abrió una zanja que dejó la sílice a la vista.'},
 src:['NASA · Spirit y Opportunity','https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/']},
'Opportunity': {kind:'Rover · NASA, 2004',
 story:['Soy Opportunity, gemelo de Spirit. Aterricé el 25 de enero de 2004 en Meridiani Planum y rodé justo dentro de un pequeño cráter. ¡Un hoyo en uno!',
 'Encontré pequeñas esferas de hematita, que la gente llamó «arándanos». Se forman con agua. Marte tuvo agua líquida hace mucho tiempo.',
 'Debía durar 90 días. Duré casi 15 años y recorrí 45 km, más que ningún otro vehículo fuera de la Tierra hasta entonces.',
 'En 2018 una tormenta de polvo cubrió el cielo de todo el planeta y mis paneles solares se quedaron sin luz. Mi última señal llegó el 10 de junio de 2018.'],
 facts:[['Aterrizaje','25 de enero de 2004, Meridiani Planum'],['Recorrido','45,16 km'],['Última señal','10 de junio de 2018'],['Fin de misión','13 de febrero de 2019']],
 quiz:{q:'¿Qué apagó a Opportunity en 2018?',o:['Una tormenta de polvo que tapó el Sol en todo el planeta','Un choque con una roca','Se le gastaron las ruedas'],a:0,e:'Opportunity dependía de la luz solar. La tormenta oscureció el cielo durante meses.'},
 src:['NASA · Spirit y Opportunity','https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/']},
'Phoenix': {kind:'Módulo de aterrizaje · NASA, 2008',
 story:['Soy Phoenix. Aterricé el 25 de mayo de 2008 en el ártico de Marte, mucho más al norte que cualquier nave anterior.',
 'Con mi brazo robótico cavé zanjas y vi trocitos blancos. Pocos días después habían desaparecido: era hielo de agua que se convirtió en vapor.',
 'También vi nieve cayendo de las nubes, aunque se evaporaba antes de tocar el suelo. Y encontré perclorato, una sal importante para saber si Marte pudo albergar vida.',
 'Cuando llegó el invierno polar, el Sol casi desapareció y me quedé sin energía. Mi última señal llegó el 2 de noviembre de 2008.'],
 facts:[['Aterrizaje','25 de mayo de 2008, Vastitas Borealis'],['Descubrimiento','Hielo de agua bajo la superficie'],['Última señal','2 de noviembre de 2008'],['Hoy','Bajo el hielo de dióxido de carbono cada invierno']],
 quiz:{q:'¿Cómo supo Phoenix que los trocitos blancos eran hielo de agua?',o:['Los probó con una lengua robótica','Desaparecieron en pocos días al convertirse en vapor','Brillaban en la oscuridad'],a:1,e:'La sal no desaparece. El hielo expuesto al aire marciano sí, porque pasa directamente a vapor.'},
 src:['NASA · Phoenix','https://science.nasa.gov/mission/phoenix/']},
'InSight': {kind:'Módulo de aterrizaje · NASA, 2018',
 story:['Soy InSight. Llegué el 26 de noviembre de 2018 a Elysium Planitia, una llanura lisa, perfecta para quedarme quieto y escuchar.',
 'Mi sismómetro sentía los marsmotos, los temblores de Marte. Registré más de 1.300.',
 'Las ondas de esos temblores atraviesan el planeta y rebotan en sus capas. Gracias a ellas se midió por primera vez el tamaño del núcleo de otro planeta.',
 'El polvo fue cubriendo mis paneles solares poco a poco. En diciembre de 2022 me quedé sin energía.'],
 facts:[['Aterrizaje','26 de noviembre de 2018, Elysium Planitia'],['Marsmotos detectados','Más de 1.300'],['Última señal','15 de diciembre de 2022'],['Hoy','Inactivo, cubierto de polvo']],
 quiz:{q:'¿Para qué sirvieron los marsmotos que escuchó InSight?',o:['Para encontrar petróleo','Para conocer el interior de Marte, incluido su núcleo','Para predecir tormentas de polvo'],a:1,e:'Las ondas sísmicas cambian al cruzar materiales distintos. Así se «ve» por dentro un planeta.'},
 src:['NASA · InSight','https://science.nasa.gov/mission/insight/']},
'Perseverance e Ingenuity': {kind:'Helicóptero Ingenuity · NASA, 2021',
 story:['Soy Ingenuity, un helicóptero de 1,8 kg. Viajé a Marte bajo la panza del rover Perseverance y llegué al cráter Jezero en febrero de 2021.',
 'El aire de Marte es tan delgado, un 1 % del de la Tierra, que mis hélices giran unas 2.400 veces por minuto para poder sostenerme.',
 'El 19 de abril de 2021 hice el primer vuelo con motor y controlado en otro planeta. Llevo un trocito de tela del avión de los hermanos Wright, el primero en volar en la Tierra.',
 'Me pidieron 5 vuelos. Hice 72. En el último, en enero de 2024, dañé mis hélices. Ya no vuelo, pero sigo de pie en el cráter. Perseverance continúa su viaje.'],
 facts:[['Llegada','18 de febrero de 2021, cráter Jezero'],['Primer vuelo','19 de abril de 2021'],['Vuelos','72 (planeados: 5)'],['Hoy','En tierra, con las hélices dañadas']],
 quiz:{q:'¿Por qué las hélices de Ingenuity giran tan rápido?',o:['Porque en Marte el aire es muy delgado','Porque Marte tiene más gravedad que la Tierra','Para espantar el polvo'],a:0,e:'Con tan poco aire, las hélices tienen que mover mucho aire por segundo para levantarse. Marte tiene menos gravedad que la Tierra, y eso ayuda.'},
 src:['NASA · Ingenuity','https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/']}
};
// Ecos del espacio profundo (no tienen lugar en el mapa 3D: se escuchan desde el archivo)
const DEEP = [
{id:'near',name:'NEAR Shoemaker',kind:'En el asteroide Eros · NASA, 1996',
 story:['Soy NEAR Shoemaker. El 14 de febrero de 2000, Día de San Valentín, fui la primera nave en orbitar un asteroide: Eros, una roca con forma de cacahuate de unos 34 km de largo.',
 'Durante un año lo fotografié y lo medí desde todas las direcciones.',
 'No me construyeron para aterrizar. Aun así, el 12 de febrero de 2001 el equipo me hizo bajar despacio y toqué la superficie. Fui la primera nave en posarse en un asteroide.',
 'Seguí enviando datos desde el suelo hasta el 28 de febrero de 2001. Mi nombre recuerda al geólogo planetario Eugene Shoemaker.'],
 facts:[['Lanzamiento','17 de febrero de 1996'],['Órbita de Eros','14 de febrero de 2000'],['Aterrizaje','12 de febrero de 2001'],['Hoy','Sobre la superficie de 433 Eros']],
 quiz:{q:'¿Qué tuvo de especial el aterrizaje de NEAR Shoemaker?',o:['Fue en la cara oculta de la Luna','La nave no estaba diseñada para aterrizar y aun así lo logró','Aterrizó con paracaídas'],a:1,e:'Fue una maniobra extra al final de la misión, y la nave sobrevivió para seguir enviando datos.'},
 src:['NASA · NEAR Shoemaker','https://science.nasa.gov/mission/near-shoemaker/']},
{id:'dawn',name:'Dawn',kind:'En órbita de Ceres · NASA, 2007',
 story:['Soy Dawn. Mis motores de iones empujaban con la fuerza de una hoja de papel sobre tu mano. Pero empujaban sin parar durante años, y así llegué muy lejos.',
 'Fui la primera nave en orbitar dos mundos más allá de la Tierra y la Luna: el asteroide Vesta en 2011 y el planeta enano Ceres en 2015.',
 'En Ceres encontré manchas brillantes en el cráter Occator. Son sales que dejó agua salada que subió desde el interior.',
 'En 2018 se me acabó el combustible para apuntar mi antena a la Tierra. Sigo dando vueltas a Ceres en silencio, y lo haré por décadas.'],
 facts:[['Lanzamiento','27 de septiembre de 2007'],['Vesta','Julio de 2011 a septiembre de 2012'],['Ceres','Desde marzo de 2015'],['Fin de misión','1 de noviembre de 2018']],
 quiz:{q:'¿Qué eran las manchas brillantes que Dawn vio en Ceres?',o:['Luces de otra nave','Depósitos de sales dejados por agua salada','Hielo de dióxido de carbono'],a:1,e:'Son sobre todo carbonato de sodio, una sal que quedó cuando el agua salada se evaporó.'},
 src:['NASA · Dawn','https://science.nasa.gov/mission/dawn/']},
{id:'kepler',name:'Kepler',kind:'Telescopio espacial · NASA, 2009',
 story:['Soy Kepler, un telescopio espacial. No giro alrededor de la Tierra: la sigo por detrás mientras los dos damos vueltas al Sol.',
 'Durante años miré fijamente el mismo trozo de cielo, unas 150.000 estrellas, esperando pequeños apagones. Cuando un planeta pasa delante de su estrella, su brillo baja un poquito.',
 'Para 2013 se habían roto dos de mis ruedas de orientación. Los ingenieros usaron la presión de la luz del Sol para equilibrarme, y seguí trabajando en una misión nueva llamada K2.',
 'Encontré más de 2.600 planetas. Gracias a mí sabemos que en nuestra galaxia hay más planetas que estrellas. En octubre de 2018 se me acabó el combustible.'],
 facts:[['Lanzamiento','7 de marzo de 2009'],['Método','Tránsitos: pequeñas bajadas de brillo'],['Planetas confirmados','Más de 2.600'],['Retiro','30 de octubre de 2018']],
 quiz:{q:'¿Cómo descubría Kepler planetas lejanos?',o:['Les tomaba fotos directas','Detectaba la pequeña bajada de brillo cuando un planeta pasaba delante de su estrella','Escuchaba señales de radio'],a:1,e:'Es el método de tránsito. Si se repite con regularidad, indica un planeta en órbita.'},
 src:['NASA · Kepler','https://science.nasa.gov/mission/kepler/']},
{id:'pioneer10',name:'Pioneer 10',kind:'Sonda de espacio profundo · NASA, 1972',
 story:['Soy Pioneer 10. Despegué en marzo de 1972 y fui la primera nave en cruzar el cinturón de asteroides. Muchos temían que las rocas me destrozaran. Pasé sin problemas.',
 'En diciembre de 1973 fui la primera nave en visitar Júpiter. Medí sus enormes cinturones de radiación y su campo magnético.',
 'Llevo una placa con el dibujo de dos personas y un mapa para encontrar el Sol, por si alguien me encuentra algún día.',
 'Mi última señal, muy débil, llegó el 23 de enero de 2003. Sigo viajando hacia la estrella Aldebarán. Tardaré unos dos millones de años en pasar cerca de ella.'],
 facts:[['Lanzamiento','2 de marzo de 1972'],['Júpiter','3 de diciembre de 1973'],['Última señal','23 de enero de 2003'],['Hoy','Saliendo del sistema solar, rumbo a Aldebarán']],
 quiz:{q:'¿Para qué lleva Pioneer 10 una placa con dibujos?',o:['Para decorar la nave','Como mensaje por si alguien en otro mundo la encuentra','Para protegerla de la radiación'],a:1,e:'La placa muestra quiénes la enviaron y desde dónde, usando un mapa de púlsares.'},
 src:['NASA · Pioneer 10','https://science.nasa.gov/mission/pioneer-10/']}
];
const LUNA2_QUIZ = {
  es:{q:'¿Qué descubrió Luna 2 sobre la Luna?',o:['Que no tiene un campo magnético global importante','Que tiene océanos bajo el hielo','Que tiene volcanes activos'],a:0,e:'Sus instrumentos midieron el campo magnético y los cinturones de radiación al acercarse, y no encontró ninguno de los dos.'},
  en:{q:'What did Luna 2 discover about the Moon?',o:['It has no significant global magnetic field','It has oceans under the ice','It has active volcanoes'],a:0,e:'Its instruments measured the magnetic field and radiation belts as it approached, and found neither.'}
};

/* ---------- 3. EL ARCHIVO ---------- */
const KEY = 'ecos3d-v1';
let archived = new Set();
try { const s = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(s)) archived = new Set(s); } catch (e) {}
['near', 'dawn', 'kepler', 'pioneer10'].forEach(k => { if (archived.delete(k)) archived.add('deep:' + k); });   // arreglo de una versión anterior
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...archived])); } catch (e) {} };
const TOTAL = SITES.length + 1 + DEEP.length;

const strip = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.trim(); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* Convierte cualquier eco (sitio 3D, Luna 2 o espacio profundo) en una ficha para el receptor */
function echoFromSite(st) {
  const c = CUSTOM[st.n];
  if (c && ES()) return Object.assign({ id: 'site:' + st.n, name: st.n }, c);
  const s = siteStory(st)[ES() ? 'es' : 'en'];
  const g = SITE_GROUPS[st.g];
  // Pregunta automática: ¿para qué fue enviada? (opciones de otras misiones)
  // Las opciones falsas salen de misiones del mismo mundo (Luna o Marte), para que no sea tan fácil
  const bodyOf = k => (SITES.find(x => x.g === k) || {}).b;
  const pool = Object.keys(SITE_GROUPS).filter(k => k !== st.g && SITE_GROUPS[k].p !== g.p && !/^igual/.test(SITE_GROUPS[k].p));
  const same = shuffle(pool.filter(k => bodyOf(k) === st.b)), rest = shuffle(pool.filter(k => bodyOf(k) !== st.b));
  const others = same.concat(rest).slice(0, 2);
  const opts = shuffle([g.p].concat(others.map(k => SITE_GROUPS[k].p)));
  return {
    id: 'site:' + st.n, name: st.n, kind: g.w,
    story: [strip(s.sub)].concat(s.paras.map(strip)),
    facts: s.card.map(r => [r[0], strip(r[1])]),
    quiz: { q: tx('¿Para qué enviaron a ' + st.n + '?', 'What was ' + st.n + ' sent to do? (answers in Spanish)'), o: opts.map(cap), a: opts.indexOf(g.p), e: tx('Lo contó en su historia: «' + cap(g.p) + '»', 'It said so in its story.') },
    src: c ? c.src : ['NSSDCA', 'https://nssdc.gsfc.nasa.gov/']
  };
}
function echoLuna2() {
  const s = LUNA2_STORY[ES() ? 'es' : 'en'];
  return { id: 'luna2', name: 'Luna 2', kind: tx('Sonda de impacto · URSS, 1959', 'Impact probe · USSR, 1959'),
    story: [strip(s.sub)].concat(s.paras.map(strip)), facts: s.card.map(r => [r[0], strip(r[1])]),
    quiz: LUNA2_QUIZ[ES() ? 'es' : 'en'], src: ['NSSDCA · Luna 2', 'https://nssdc.gsfc.nasa.gov/'] };
}
function echoDeep(d) { return Object.assign({}, d, { id: 'deep:' + d.id }); }

/* Medidor (arriba a la derecha) */
const meter = document.createElement('button');
meter.id = 'e-meter'; meter.type = 'button';
meter.innerHTML = '<span class="lbl"></span><span class="num"></span><span class="bar"><i></i></span>';
document.body.appendChild(meter);
meter.onclick = () => { window.toggleSitesPanel(); };
function renderMeter() {
  meter.querySelector('.lbl').textContent = tx('Ecos archivados', 'Echoes archived');
  meter.querySelector('.num').innerHTML = '<span>' + archived.size + '</span> / ' + TOTAL;
  meter.querySelector('.bar i').style.width = (archived.size / TOTAL * 100) + '%';
  meter.setAttribute('aria-label', tx('Abrir el archivo: ', 'Open the archive: ') + archived.size + ' / ' + TOTAL);
}

/* Lista de misiones = el archivo. Clic en el nombre: viajar. "Sintonizar": escuchar ya. */
function row(id, label, onGo, onTune) {
  const r = document.createElement('div'); r.className = 'e-row' + (archived.has(id) ? ' done' : '');
  const b = document.createElement('button'); b.className = 'site-btn'; b.type = 'button';
  b.innerHTML = '<span class="dot"></span><span></span>'; b.lastChild.textContent = label;
  if (onGo) b.onclick = onGo; else b.onclick = onTune;
  r.appendChild(b);
  const t = document.createElement('button'); t.className = 'tune'; t.type = 'button'; t.textContent = tx('Sintonizar', 'Tune in');
  t.setAttribute('aria-label', tx('Sintonizar el eco de ', 'Tune in to the echo of ') + label); t.onclick = onTune;
  r.appendChild(t);
  return r;
}
function buildSitesPanel() {
  const p = document.getElementById('sites-panel'); p.innerHTML = '';
  const close = document.createElement('button'); close.className = 'panel-close'; close.textContent = '✕';
  close.setAttribute('aria-label', tx('Cerrar', 'Close')); close.onclick = () => closePanel('sites-panel'); p.appendChild(close);
  const h = t => { const e = document.createElement('h3'); e.textContent = t; p.appendChild(e); };
  const note = t => { const e = document.createElement('p'); e.className = 'e-note'; e.textContent = t; p.appendChild(e); };
  h(tx('ARCHIVO DE ECOS', 'ECHO ARCHIVE'));
  note(tx('Toca un nombre para volar hasta allí, o «Sintonizar» para escuchar su eco ahora. Verde = archivado.', 'Tap a name to fly there, or "Tune in" to hear its echo now. Green = archived.'));
  h(tx('LUNA', 'MOON'));
  p.appendChild(row('luna2', 'Luna 2', null, () => openEcho(echoLuna2())));
  SITES.forEach((st, i) => { if (st.b === 'm') p.appendChild(row('site:' + st.n, st.n, () => travel(i), () => openEcho(echoFromSite(st)))); });
  h(tx('MARTE', 'MARS'));
  SITES.forEach((st, i) => { if (st.b === 'M') p.appendChild(row('site:' + st.n, st.n, () => travel(i), () => openEcho(echoFromSite(st)))); });
  h(tx('ESPACIO PROFUNDO', 'DEEP SPACE'));
  note(tx('Están demasiado lejos para volar hasta ellas: solo se pueden escuchar.', 'Too far away to fly to: you can only listen to them.'));
  DEEP.forEach(d => p.appendChild(row('deep:' + d.id, d.name, null, () => openEcho(echoDeep(d)))));
}
function travel(i) {
  // Viaja y aterriza en el mismo instante: si esperas, la Luna gira y quedas lejos de la máquina
  if (window.__juego) window.__juego.aterrizarEn(i); else window.goToSite(i);
  setTimeout(() => triggerEveMessage(tx('🛰️ Aterrizamos junto a ' + SITES[i].n + '. Pulsa E (o toca 💬) para sintonizar su eco. El rayo de luz marca dónde quedó tu nave.',
                       '🛰️ We landed next to ' + SITES[i].n + '. Press E (or tap 💬) to tune in to its echo. The beam of light marks where your ship is.')), 600);
}
window.toggleSitesPanel = function () {
  const p = document.getElementById('sites-panel');
  buildSitesPanel();
  document.getElementById('pads-panel').classList.remove('active'); closeCommentsPanel();
  p.classList.toggle('active');
  if (p.classList.contains('active') && isHudVisible) window.toggleHUD();   // que no se encimen
  document.getElementById('menu-dropdown').classList.remove('active');
};
// Hablar con una máquina (E, clic en el 3D) abre el receptor en vez del texto largo
window.openSitePanel = st => openEcho(echoFromSite(st));
window.openLuna2Panel = () => openEcho(echoLuna2());

/* Botón "?" y controles que se esconden solos */
const help = document.createElement('button');
help.id = 'e-help'; help.type = 'button'; help.textContent = '?';
help.onclick = () => window.toggleHUD();
document.body.appendChild(help);
const _init = window.initExperience;
window.initExperience = function () {
  _init();
  setTimeout(() => { if (isHudVisible && overlay.hidden) window.toggleHUD(); }, 14000);
};
// Etiqueta pequeña sobre el título de inicio
const eb = document.createElement('div'); eb.id = 'e-eyebrow'; eb.className = 'e-eyebrow';
document.getElementById('start-screen').insertBefore(eb, document.getElementById('start-title'));

/* ---------- 4. SONIDOS DEL RECEPTOR ---------- */
let actx = null, noiseGain = null, toneOsc = null, toneGain = null;
function audioInit() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = .6;
    noiseGain = actx.createGain(); noiseGain.gain.value = 0; src.connect(f).connect(noiseGain).connect(actx.destination); src.start();
    toneOsc = actx.createOscillator(); toneGain = actx.createGain(); toneGain.gain.value = 0;
    toneOsc.connect(toneGain).connect(actx.destination); toneOsc.start();
  } catch (e) { actx = null; }
}
const soundOn = () => isMusicPlaying && actx;
function setAudio(noise, tone, freq) {
  if (!actx) return; const t = actx.currentTime, on = soundOn() ? 1 : 0;
  noiseGain.gain.setTargetAtTime(noise * .06 * on, t, .05); toneGain.gain.setTargetAtTime(tone * .04 * on, t, .05);
  if (freq) toneOsc.frequency.setTargetAtTime(freq, t, .05);
}
function beep(f, dur) {
  if (!soundOn()) return; const o = actx.createOscillator(), g = actx.createGain();
  o.frequency.value = f; g.gain.value = .06; o.connect(g).connect(actx.destination); o.start();
  g.gain.setTargetAtTime(0, actx.currentTime + dur * .6, dur * .2); o.stop(actx.currentTime + dur);
}

/* ---------- 5. EL RECEPTOR ---------- */
const overlay = document.createElement('div');
overlay.id = 'e-overlay'; overlay.hidden = true;
overlay.innerHTML = '<div class="rx" role="dialog" aria-modal="true" aria-labelledby="rx-title"><div class="rx-head"><div><div class="rx-eyebrow" id="rx-kind"></div><h2 id="rx-title"></h2></div>' +
  '<button class="rx-x" id="rx-close" type="button">×</button></div><div class="rx-phase" id="rx-phase"><span></span><span></span><span></span></div><div class="rx-body" id="rx-body"></div></div>';
document.body.appendChild(overlay);
const body = overlay.querySelector('#rx-body'), $ = s => overlay.querySelector(s);
let cur = null, loop = null, cleanup = [], lastFocus = null, keyHandler = null;

// Mientras el receptor está abierto, las teclas no mueven la nave
window.addEventListener('keydown', e => {
  if (overlay.hidden) return;
  if (e.key === 'Escape') { e.stopPropagation(); closeEcho(); return; }
  if (keyHandler) keyHandler(e, true);
  if (!overlay.contains(e.target)) e.stopPropagation();
}, true);
overlay.addEventListener('keydown', e => e.stopPropagation());
window.addEventListener('keyup', e => { if (!overlay.hidden) { if (keyHandler) keyHandler(e, false); e.stopPropagation(); } }, true);
overlay.addEventListener('click', e => { if (e.target === overlay) closeEcho(); });
$('#rx-close').onclick = () => closeEcho();

function stopLoop() { running = false; if (loop) cancelAnimationFrame(loop); loop = null; cleanup.forEach(f => f()); cleanup = []; keyHandler = null; setAudio(0, 0); }
function setPhase(i) {
  const names = [tx('Sintonizar', 'Tune in'), tx('Escuchar', 'Listen'), tx('Desafío', 'Challenge')];
  [...$('#rx-phase').children].forEach((s, k) => { s.textContent = names[k]; s.className = k < i ? 'ok' : k === i ? 'cur' : ''; });
}
function openEcho(echo) {
  cur = echo; lastFocus = document.activeElement;
  ['sites-panel', 'pads-panel', 'luna2-panel'].forEach(id => document.getElementById(id).classList.remove('active'));
  window.dispatchEvent(new Event('blur'));               // suelta las teclas de la nave
  audioInit(); if (actx) actx.resume();
  try { bgAudio.volume = 0.25; } catch (e) {}
  $('#rx-kind').textContent = echo.kind; $('#rx-title').textContent = echo.name;
  $('#rx-close').setAttribute('aria-label', tx('Cerrar el receptor', 'Close the receiver'));
  overlay.hidden = false;
  if (archived.has(echo.id)) showStory(true); else showTune();
  $('#rx-close').focus();
}
function closeEcho() {
  stopLoop(); overlay.hidden = true; cur = null;
  try { bgAudio.volume = 0.6; } catch (e) {}
  if (lastFocus && lastFocus.isConnected && lastFocus !== document.body) lastFocus.focus();
}

/* Fase 1: sintonizar */
function showTune() {
  stopLoop(); setPhase(0);
  const target = 1.6 + Math.random() * 4.2;
  body.innerHTML = '<p class="rx-hint"></p><canvas class="rx-scope" width="900" height="300" aria-hidden="true"></canvas>' +
    '<div class="rx-dial"><label for="rx-freq"><span></span><span id="rx-fv"></span></label>' +
    '<input type="range" id="rx-freq" min="1" max="7" step="0.01" value="' + (target > 4 ? 1.4 : 6.6) + '"></div><div class="rx-lock" id="rx-lock" aria-live="polite"></div>';
  body.querySelector('.rx-hint').textContent = tx('Hay un eco muy débil. Mueve el dial hasta que tu onda coincida con la onda fantasma y el ruido desaparezca.',
    'There is a very faint echo. Move the dial until your wave matches the ghost wave and the noise disappears.');
  body.querySelector('label span').textContent = tx('Frecuencia del receptor', 'Receiver frequency');
  const cv = body.querySelector('canvas'), c = cv.getContext('2d'), inp = $('#rx-freq'), lock = $('#rx-lock');
  let held = 0, last = performance.now(), done = false; const t0 = last;
  inp.focus();
  const step = now => {
    const dt = (now - last) / 1000; last = now;
    const f = +inp.value, err = Math.abs(f - target), clean = Math.max(0, 1 - err / 1.2);
    $('#rx-fv').textContent = (8.40 + (f - 4) * 0.02).toFixed(3) + ' GHz · ' + tx('banda X', 'X band');
    c.fillStyle = '#050a10'; c.fillRect(0, 0, 900, 300);
    c.strokeStyle = '#1d2a3d'; c.lineWidth = 1;
    for (let x = 0; x < 900; x += 75) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 300); c.stroke(); }
    for (let y = 0; y < 300; y += 75) { c.beginPath(); c.moveTo(0, y); c.lineTo(900, y); c.stroke(); }
    const ph = (now - t0) / 700;
    c.strokeStyle = 'rgba(163,172,206,.4)'; c.lineWidth = 3; c.setLineDash([8, 8]); c.beginPath();
    for (let x = 0; x <= 900; x += 4) { const y = 150 + Math.sin(x / 900 * Math.PI * 2 * target + ph * target) * 90; x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke(); c.setLineDash([]);
    const noise = (1 - clean) * 70; c.strokeStyle = clean > .93 ? '#80dcc6' : '#ffb84d'; c.lineWidth = 3; c.beginPath();
    for (let x = 0; x <= 900; x += 4) { const y = 150 + Math.sin(x / 900 * Math.PI * 2 * f + ph * f) * 90 * (.4 + .6 * clean) + (Math.random() - .5) * noise; x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
    setAudio(1 - clean, clean, 220 + f * 60);
    if (!done) {
      if (err < 0.1) {
        held += dt; lock.className = 'rx-lock ok'; lock.textContent = tx('Señal fijada… mantén el dial quieto', 'Signal locked… hold the dial still');
        if (held > 0.7) { done = true; beep(880, .25); lock.textContent = tx('Eco recuperado', 'Echo recovered'); setTimeout(() => { if (cur) showStory(false); }, 500); }
      } else {
        held = 0; lock.className = 'rx-lock';
        lock.textContent = err < 0.5 ? tx('¡Cerca! Ajusta despacio', 'Close! Adjust slowly') : err < 1.2 ? tx('Se oye algo…', 'Something is there…') : tx('Buscando señal…', 'Searching for a signal…');
      }
    }
    loop = requestAnimationFrame(step);
  };
  loop = requestAnimationFrame(step);
}

/* Fase 2: escuchar */
function showStory(already) {
  stopLoop(); setPhase(1); const it = cur;
  body.innerHTML = '<p class="rx-voice" id="rx-voice" aria-live="polite"></p><div class="rx-prog" id="rx-prog"></div>' +
    '<p class="rx-note"></p><div class="rx-actions"><button class="rx-btn ghost" id="rx-skip" type="button"></button><button class="rx-btn" id="rx-next" type="button" hidden></button></div>' +
    '<dl class="rx-facts" id="rx-facts" hidden></dl><p class="rx-src" id="rx-src" hidden></p>';
  body.querySelector('.rx-note').textContent = tx('Narración imaginada a partir de datos reales de la misión.', 'Imagined narration based on real mission data.');
  $('#rx-next').textContent = already ? tx('Repetir el desafío', 'Replay the challenge') : tx('Ir al desafío', 'Go to the challenge');
  const v = $('#rx-voice'), skip = $('#rx-skip'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let line = 0, ch = 0, timer = null;
  const render = (cursor) => { v.textContent = it.story[line].slice(0, ch); if (cursor) { const s = document.createElement('span'); s.className = 'cur'; v.appendChild(s); }
    $('#rx-prog').textContent = (line + 1) + ' / ' + it.story.length; };
  const finishLine = () => {
    clearInterval(timer); timer = null; ch = it.story[line].length;
    if (line < it.story.length - 1) { render(true); skip.textContent = tx('Continuar', 'Continue'); }
    else { render(false); reveal(); }
  };
  const startLine = () => {
    ch = 0; skip.textContent = tx('Mostrar todo', 'Show all');
    if (reduce) { finishLine(); return; }
    timer = setInterval(() => { ch += 2; if (ch % 8 === 0) beep(600 + Math.random() * 200, .03); if (ch >= it.story[line].length) finishLine(); else render(true); }, 28);
  };
  const reveal = () => {
    skip.hidden = true;
    const dl = $('#rx-facts'); dl.hidden = false;
    it.facts.forEach(([k, val]) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = val; dl.append(dt, dd); });
    const s = $('#rx-src'); s.hidden = false; s.textContent = tx('Fuente: ', 'Source: ');
    const a = document.createElement('a'); a.href = it.src[1]; a.target = '_blank'; a.rel = 'noopener'; a.textContent = it.src[0]; s.appendChild(a);
    const n = $('#rx-next'); n.hidden = false; n.focus();
  };
  skip.onclick = () => { if (timer) finishLine(); else if (line < it.story.length - 1) { line++; startLine(); } };
  $('#rx-next').onclick = () => showChallenge();
  cleanup.push(() => clearInterval(timer));
  startLine(); skip.focus();
}

/* ==========================================================================
   Fase 3: DESAFÍO — cada máquina tiene un minijuego que muestra lo que hizo
   --------------------------------------------------------------------------
   Tipos de minijuego (todos con datos reales):
     aterrizar  · módulos de aterrizaje (Luna, Marte y el asteroide Eros)
     conducir   · rovers: llegar a las rocas y analizarlas sin atascarse
     cavar      · brazo con pala: Phoenix (hielo), Viking y Surveyor 7 (suelo)
     perforar   · taladros: Luna 24 y Chang'e 5/6 (no dejes que se caliente)
     sismos     · sismómetros: Apolo 12, Apolo 14 e InSight (sismo vs. viento)
     laser      · retrorreflector del Apolo 15 (medir la distancia a la Luna)
     helicoptero· Ingenuity (primer vuelo: subir a 3 m, mantenerse y bajar)
     transito   · Kepler (detectar el pequeño apagón de una estrella)
     cinturon   · Pioneer 10 (cruzar el cinturón de asteroides)
     iones      · Dawn (motor de iones suave para alcanzar a Ceres)
     impacto    · Luna 2 (apuntar a donde ESTARÁ la Luna)
   ========================================================================== */
const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const MUNDO = {
  luna:  { g: 1.62, cielo: ['#000000', '#06080f'], suelo: '#8f8b84', suelo2: '#6d6a64', estrellas: true, tierra: true },
  marte: { g: 3.71, cielo: ['#3b2a2c', '#c39466'], suelo: '#b5623a', suelo2: '#8a4526', estrellas: false },
  eros:  { g: 0.25, cielo: ['#000000', '#06080f'], suelo: '#8a7a62', suelo2: '#6a5c48', estrellas: true }
};
const num = (n, d = 1) => n.toFixed(d).replace('.', ',');

/* Qué minijuego le toca a cada máquina */
const POR_NOMBRE = {
  'Surveyor 3': { t: 'aterrizar', w: 'luna', hint: 'Mis motores no se apagaron a tiempo y reboté dos veces. <strong>Aterriza más suave que yo.</strong>' },
  'Surveyor 7': { t: 'cavar', w: 'luna', obj: 'suelo', hint: 'Llevaba una pala para cavar zanjas y ver cómo era el suelo por dentro. <strong>Recoge una muestra sin chocar con rocas.</strong>' },
  'Apolo 11': { t: 'aterrizar', w: 'luna', fuel: 55, zona: [42, 60], hint: 'Neil Armstrong vio que el piloto automático los llevaba a un campo de rocas. Tomó el control y aterrizó con poco combustible. <strong>Muévete a la zona sin rocas y posa el Eagle con suavidad.</strong>' },
  'Apolo 12': { t: 'sismos', w: 'luna', campana: true, hint: 'Mi sismómetro escuchaba la Luna. <strong>Marca los lunamotos y no te confundas con el ruido.</strong> En la Luna los temblores duran muchísimo: la Luna «suena como una campana».' },
  'Apolo 14': { t: 'sismos', w: 'luna', campana: true, hint: 'Los astronautas golpearon el suelo con pequeñas cargas para medir sus capas, y el sismómetro escuchó. <strong>Marca los temblores reales.</strong>' },
  'Apolo 15': { t: 'laser' },
  'Apolo 16': { t: 'conducir', w: 'luna', lrv: true, obj: 'rocas de las tierras altas', look: 'roca', hint: 'Con el rover lunar los astronautas iban lejos del módulo a recoger rocas. <strong>Conduce hasta las rocas marcadas y analízalas.</strong>' },
  'Apolo 17': { t: 'conducir', w: 'luna', lrv: true, obj: 'manchas de suelo naranja', look: 'naranja', hint: 'Harrison Schmitt descubrió suelo naranja: vidrio volcánico. <strong>Conduce hasta las manchas naranjas.</strong>' },
  'Lunokhod 1': { t: 'conducir', w: 'luna', solar: true, obj: 'zonas de suelo', look: 'roca', hint: 'Fui el primer rover manejado a distancia en otro mundo, desde la Tierra. <strong>Analiza el suelo sin gastar toda la batería.</strong>' },
  'Lunokhod 2': { t: 'conducir', w: 'luna', solar: true, obj: 'zonas de suelo', look: 'roca', hint: 'Recorrí unos 39 km por la Luna, conducido desde la Tierra. <strong>Analiza el suelo sin gastar toda la batería.</strong>' },
  'Luna 24': { t: 'perforar', w: 'luna', meta: 200, hint: 'Mi taladro sacó una columna de suelo de unos 2 m y la llevé a la Tierra. <strong>Perfora hasta 200 cm sin que el taladro se recaliente.</strong>' },
  "Chang'e 3 y Yutu": { t: 'conducir', w: 'luna', solar: true, obj: 'rocas', look: 'roca', hint: 'Yutu estudió el suelo con un radar y espectrómetros. <strong>Analiza las rocas marcadas.</strong>' },
  "Chang'e 4 y Yutu-2": { t: 'conducir', w: 'luna', solar: true, obj: 'rocas', look: 'roca', hint: 'Yutu-2 fue el primer rover en la cara oculta de la Luna. <strong>Analiza las rocas marcadas.</strong>' },
  "Chang'e 5": { t: 'perforar', w: 'luna', meta: 100, hint: 'Perforé cerca de 1 m de suelo y envié las muestras a la Tierra. <strong>Perfora hasta 100 cm sin recalentar el taladro.</strong>' },
  "Chang'e 6": { t: 'perforar', w: 'luna', meta: 100, hint: 'Traje las primeras muestras de la cara oculta de la Luna. <strong>Perfora hasta 100 cm sin recalentar el taladro.</strong>' },
  'Chandrayaan-3 (Vikram y Pragyan)': { t: 'conducir', w: 'luna', solar: true, obj: 'zonas con azufre', look: 'amarillo', hint: 'El pequeño rover Pragyan encontró azufre cerca del polo sur. <strong>Analiza las zonas amarillas.</strong>' },
  'SLIM': { t: 'aterrizar', w: 'luna', zona: [46, 56], hint: 'Mi misión era aterrizar con precisión de decenas de metros. <strong>Toca el suelo dentro de la zona marcada.</strong>' },
  'Viking 1': { t: 'cavar', w: 'marte', obj: 'suelo', hint: 'Con mi brazo recogí suelo y lo metí en mis laboratorios para buscar vida. <strong>Recoge una muestra sin chocar con rocas.</strong>' },
  'Viking 2': { t: 'cavar', w: 'marte', obj: 'suelo', hint: 'Igual que Viking 1, recogí suelo para buscar vida. Algunas rocas bloqueaban mi pala. <strong>Recoge una muestra limpia.</strong>' },
  'Mars Pathfinder y Sojourner': { t: 'conducir', w: 'marte', solar: true, lento: true, obj: 'rocas Barnacle Bill, Yogi y Wedge', look: 'roca', hint: 'Sojourner era pequeño y lento: medía la química de las rocas con su espectrómetro. <strong>Llega a las tres rocas.</strong>' },
  'Spirit': { t: 'conducir', w: 'marte', solar: true, arena: 6, obj: 'manchas de sílice', look: 'blanco', hint: 'Una rueda rota me dejó ver suelo blanco: sílice de antiguas aguas termales. <strong>Encuentra la sílice y no te quedes atascado en la arena, como me pasó en 2009.</strong>' },
  'Opportunity': { t: 'conducir', w: 'marte', solar: true, obj: '«arándanos» de hematita', look: 'bayas', hint: 'Encontré esferitas de hematita que se forman con agua. <strong>Analiza los «arándanos».</strong> Mis paneles solares se recargan cuando estoy quieto.' },
  'Phoenix': { t: 'cavar', w: 'marte', obj: 'hielo', hint: 'Cavé en el ártico de Marte y encontré trocitos blancos que días después desaparecieron. <strong>Cava hasta encontrar hielo, evitando las rocas.</strong>' },
  'InSight': { t: 'sismos', w: 'marte', viento: true, hint: 'Mi sismómetro escuchaba marsmotos, pero el viento de Marte también lo sacudía. <strong>Marca solo los sismos.</strong>' },
  'Curiosity': { t: 'conducir', w: 'marte', rtg: true, obj: 'rocas para perforar', look: 'roca', hint: 'Sigo activo en el cráter Gale buscando dónde pudo haber vida. <strong>Llega a las rocas marcadas.</strong>' },
  'Zhurong': { t: 'conducir', w: 'marte', solar: true, obj: 'dunas con minerales', look: 'roca', hint: 'Fui el primer rover chino en Marte. <strong>Estudia los puntos marcados.</strong>' },
  'Perseverance e Ingenuity': { t: 'helicoptero' }
};
const POR_GRUPO = { l9: 'luna', srv: 'luna', ber: 'luna', ch3: 'luna', im1: 'luna', bg1: 'luna', im2: 'luna', m23: 'marte', m6: 'marte', mpl: 'marte', bgl: 'marte', sch: 'marte' };
const FALLIDAS = { ber: 1, mpl: 1, sch: 1, m6: 1, bgl: 1, m23: 1 };
function juegoDe(echo) {
  if (echo.id === 'luna2') return { t: 'impacto' };
  if (echo.id.startsWith('deep:')) return {
    near: { t: 'aterrizar', w: 'eros', h0: 60, v0: 4, th: 0.6, burn: 3, maxV: 2, hint: 'No me diseñaron para aterrizar, pero bajé despacio sobre Eros y sobreviví. <strong>Posa la nave a menos de 2 m/s.</strong> En Eros la gravedad es más de mil veces menor que en la Tierra; aquí la aumentamos para no tardar horas.' },
    dawn: { t: 'iones' }, kepler: { t: 'transito' }, pioneer10: { t: 'cinturon' } }[echo.id.slice(5)];
  const n = echo.id.slice(5);
  if (POR_NOMBRE[n]) return POR_NOMBRE[n];
  const st = SITES.find(s => s.n === n); if (!st) return null;
  const w = POR_GRUPO[st.g] || (st.b === 'M' ? 'marte' : 'luna');
  return { t: 'aterrizar', w, hint: FALLIDAS[st.g]
    ? n + ' no logró aterrizar entero. <strong>Consigue lo que no pudo: toca el suelo con suavidad.</strong>'
    : 'Mi trabajo empezaba con un aterrizaje suave. <strong>Posa el módulo a menos de 2,5 m/s.</strong>' };
}
function showChallenge() {
  stopLoop(); setPhase(2);
  const j = juegoDe(cur);
  const T = { aterrizar: gAterrizar, conducir: gConducir, cavar: gCavar, perforar: gPerforar, sismos: gSismos, laser: gameLaser,
    helicoptero: gHelicoptero, transito: gTransito, cinturon: gCinturon, iones: gIones, impacto: gImpacto };
  if (j && T[j.t]) T[j.t](j); else quiz(cur);
}

/* ---------- Marco común: texto, marcador, lienzo, botones y teclas ---------- */
let running = false;
function gameFrame(o) {
  const H = o.h || 420;
  body.innerHTML = '<p class="rx-hint"></p><div class="rx-hud"></div><canvas class="rx-game" width="720" height="' + H + '"></canvas><div class="rx-actions"></div><p class="rx-fb" aria-live="polite"></p>';
  body.querySelector('.rx-hint').innerHTML = o.hint;
  const hud = body.querySelector('.rx-hud'), vals = {};
  (o.hud || []).forEach(([k, l, u]) => { const s = document.createElement('span'); s.append(l + ' '); const b = document.createElement('b'); b.textContent = '–'; s.append(b); if (u) s.append(' ' + u); hud.appendChild(s); vals[k] = b; });
  const act = body.querySelector('.rx-actions'), inp = {}, keymap = {}, btn = {};
  (o.btns || []).forEach(d => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'rx-btn' + (d.ghost ? ' ghost' : '') + (d.hold ? ' hold' : '');
    b.textContent = d.label; if (d.aria) b.setAttribute('aria-label', d.aria); act.appendChild(b); btn[d.id] = b;
    if (d.hold) {
      inp[d.id] = false;
      const on = e => { e.preventDefault(); inp[d.id] = true; b.classList.add('on'); }, off = () => { inp[d.id] = false; b.classList.remove('on'); };
      b.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, off));
      b.oncontextmenu = e => e.preventDefault();
    } else b.onclick = () => d.click();
    (d.keys || []).forEach(k => { keymap[k] = d; });
  });
  keyHandler = (e, down) => {
    const k = (e.key === ' ' || e.key === 'Spacebar') ? ' ' : (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const d = keymap[k]; if (!d || !running) return; e.preventDefault();
    if (d.hold) { inp[d.id] = down; btn[d.id].classList.toggle('on', down); }
    else if (down && !e.repeat && !btn[d.id].disabled) d.click();
  };
  const again = document.createElement('button'); again.type = 'button'; again.className = 'rx-btn ghost'; again.textContent = 'Intentar de nuevo';
  again.hidden = true; again.onclick = () => showChallenge(); act.appendChild(again);
  const fb = body.querySelector('.rx-fb'), cv = body.querySelector('canvas');
  if (o.canvasHold) {
    cv.addEventListener('pointerdown', e => { e.preventDefault(); inp[o.canvasHold] = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { inp[o.canvasHold] = false; }));
  }
  const end = () => { running = false; if (loop) cancelAnimationFrame(loop); loop = null; Object.values(btn).forEach(b => { b.disabled = true; b.classList.remove('on'); }); };
  const UI = {
    c: cv.getContext('2d'), cv, inp, btn, W: 720, H,
    set: (k, v) => { vals[k].textContent = v; },
    say: (m, ok) => { fb.className = 'rx-fb' + (ok === true ? ' ok' : ok === false ? ' no' : ''); fb.textContent = m; },
    fail: m => { end(); UI.say(m, false); again.hidden = false; again.focus(); beep(160, .3); },
    done: (m, arch) => { end(); UI.say(m, true); win(arch); },
    run: step => {
      running = true; let last = performance.now(); const t0 = last;
      const f = now => { if (!running) return; const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt, (now - t0) / 1000); if (running) loop = requestAnimationFrame(f); };
      loop = requestAnimationFrame(f);
    }
  };
  const first = act.querySelector('.rx-btn'); if (first) first.focus();
  return UI;
}
function cieloYSuelo(c, W, H, m, sueloY, seed) {
  const g = c.createLinearGradient(0, 0, 0, sueloY); g.addColorStop(0, m.cielo[0]); g.addColorStop(1, m.cielo[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, sueloY);
  if (m.estrellas) { const r = rng(seed || 9); for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(255,255,255,' + (.25 + r() * .5) + ')'; c.fillRect(r() * W, r() * sueloY * .9, 1, 1); } }
  if (m.tierra) { c.fillStyle = '#6fa8ff'; c.beginPath(); c.arc(620, 70, 18, 0, 7); c.fill(); c.fillStyle = m.cielo[0]; c.beginPath(); c.arc(628, 64, 16, 0, 7); c.fill(); }
  c.fillStyle = m.suelo; c.fillRect(0, sueloY, W, H - sueloY);
}

/* ---------- ATERRIZAR ---------- */
function gAterrizar(sp) {
  const m = MUNDO[sp.w || 'luna'], G = m.g, TH = sp.th || G * 2.6, BURN = sp.burn || 11, maxV = sp.maxV || 2.5, zona = sp.zona, SIDE = 1.6;
  const btns = [];
  if (zona) btns.push({ id: 'l', label: '◀', aria: 'Mover a la izquierda', hold: 1, ghost: 1, keys: ['ArrowLeft', 'a'] });
  btns.push({ id: 't', label: 'Retrocohete (mantén)', hold: 1, keys: [' ', 'ArrowUp', 'w'] });
  if (zona) btns.push({ id: 'r', label: '▶', aria: 'Mover a la derecha', hold: 1, ghost: 1, keys: ['ArrowRight', 'd'] });
  const hud = [['h', 'Altura', 'm'], ['v', 'Bajada', 'm/s']]; if (zona) hud.push(['x', 'Deriva', 'm/s']); hud.push(['f', 'Combustible', '%']);
  const UI = gameFrame({ hint: sp.hint + ' Gravedad: ' + num(G, 2) + ' m/s². Mantén el botón, la barra espaciadora o el lienzo para frenar' + (zona ? '; ◀ ▶ para moverte.' : '.'), hud, btns, canvasHold: 't' });
  const c = UI.c, W = UI.W, H = UI.H, sueloY = 380, h0 = sp.h0 || 150, esc = (sueloY - 40) / h0;
  let h = h0, v = -(sp.v0 || (sp.w === 'marte' ? 15 : 11)), x = 50, vx = zona ? (Math.random() < .5 ? -1 : 1) * (1.6 + Math.random()) : 0, fuel = sp.fuel || 100;
  const r = rng(3), crat = [...Array(14)].map(() => [r() * W, 6 + r() * 24]), rocas = [...Array(26)].map(() => [r() * 100, 4 + r() * 9]);
  const X = xm => xm / 100 * W;
  function draw(flame) {
    cieloYSuelo(c, W, H, m, sueloY, 9);
    crat.forEach(([cx, s]) => { c.strokeStyle = m.suelo2; c.beginPath(); c.ellipse(cx, sueloY + 14, s, s * .25, 0, 0, 7); c.stroke(); });
    if (zona) {
      rocas.forEach(([rx, s]) => { if (rx > zona[0] - 1 && rx < zona[1] + 1) return; c.fillStyle = m.suelo2; c.beginPath(); c.ellipse(X(rx), sueloY + 2, s, s * .7, 0, Math.PI, 0); c.fill(); });
      c.strokeStyle = 'rgba(128,220,198,.8)'; c.setLineDash([6, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(X(zona[0]), sueloY + 4); c.lineTo(X(zona[1]), sueloY + 4); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(128,220,198,.9)'; c.font = '12px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.fillText('zona segura', X((zona[0] + zona[1]) / 2), sueloY + 26); c.textAlign = 'left';
    }
    const px = X(x), y = sueloY - h * esc;
    if (flame) { c.fillStyle = '#ffb84d'; c.beginPath(); c.moveTo(px - 8, y + 8); c.lineTo(px + 8, y + 8); c.lineTo(px, y + 30 + Math.random() * 16); c.fill(); }
    if (UI.inp.l) { c.fillStyle = '#ffb84d'; c.fillRect(px + 16, y - 10, 10, 4); }
    if (UI.inp.r) { c.fillStyle = '#ffb84d'; c.fillRect(px - 26, y - 10, 10, 4); }
    c.strokeStyle = '#ece7da'; c.lineWidth = 2; c.beginPath();
    c.moveTo(px - 12, y); c.lineTo(px - 26, y + 18); c.moveTo(px + 12, y); c.lineTo(px + 26, y + 18); c.moveTo(px, y + 4); c.lineTo(px, y + 18); c.stroke();
    c.fillStyle = sp.w === 'eros' ? '#d4a017' : '#ece7da'; c.beginPath(); c.moveTo(px - 14, y); c.lineTo(px + 14, y); c.lineTo(px + 8, y - 18); c.lineTo(px - 8, y - 18); c.closePath(); c.fill();
    c.fillStyle = '#80dcc6'; c.fillRect(px - 20, y - 26, 40, 4);
    if (fuel < 25 && fuel > 0) { c.fillStyle = '#ff8a7a'; c.font = 'bold 13px "IBM Plex Mono", monospace'; c.fillText('¡POCO COMBUSTIBLE!', 14, 24); }
  }
  UI.run(dt => {
    const burn = UI.inp.t && fuel > 0; if (burn) fuel = Math.max(0, fuel - BURN * dt);
    if (zona && fuel > 0) { if (UI.inp.l) { vx -= SIDE * dt; fuel = Math.max(0, fuel - 3 * dt); } if (UI.inp.r) { vx += SIDE * dt; fuel = Math.max(0, fuel - 3 * dt); } }
    v += (-G + (burn ? TH : 0)) * dt; h += v * dt; x = Math.max(2, Math.min(98, x + vx * dt));
    if (h > h0 + 20) { h = h0 + 20; v = Math.min(v, 0); }
    if (h <= 0) {
      h = 0; draw(false); const s = Math.abs(v);
      UI.set('h', '0'); UI.set('v', num(s));
      if (zona && (x < zona[0] || x > zona[1])) return UI.fail('Tocaste el suelo fuera de la zona segura, entre rocas. Usa ◀ ▶ antes de bajar.');
      if (zona && Math.abs(vx) > 1.2) return UI.fail('Llegaste de lado a ' + num(Math.abs(vx)) + ' m/s y volcaste. Frena la deriva con ◀ ▶.');
      if (s <= maxV) return UI.done('¡Aterrizaje suave a ' + num(s) + ' m/s!', cur.name + ': aterrizaje logrado. Así empezaba toda su ciencia.');
      return UI.fail('Tocaste el suelo a ' + num(s) + ' m/s: demasiado rápido. Enciende el cohete antes y en pulsos cortos.');
    }
    draw(burn); UI.set('h', h.toFixed(0)); UI.set('v', num(Math.max(0, -v))); UI.set('f', fuel.toFixed(0)); if (zona) UI.set('x', num(vx));
  });
}

/* ---------- CONDUCIR ---------- */
function gConducir(sp) {
  const m = MUNDO[sp.w], solar = !!sp.solar;
  const UI = gameFrame({
    hint: sp.hint + ' Usa ◀ ▲ ▶ (o las flechas). Acércate a cada objetivo y <strong>quédate quieto</strong> un momento para analizarlo. Evita la arena oscura.',
    hud: [['b', 'Batería', '%'], ['n', 'Analizadas', ''], ['d', 'Recorrido', 'm']],
    btns: [{ id: 'l', label: '⟲', aria: 'Girar a la izquierda', hold: 1, ghost: 1, keys: ['ArrowLeft', 'a'] }, { id: 'f', label: '▲ Avanzar', hold: 1, keys: ['ArrowUp', 'w'] },
      { id: 'b', label: '▼', aria: 'Retroceder', hold: 1, ghost: 1, keys: ['ArrowDown', 's'] }, { id: 'r', label: '⟳', aria: 'Girar a la derecha', hold: 1, ghost: 1, keys: ['ArrowRight', 'd'] }]
  });
  const c = UI.c, W = UI.W, H = UI.H, r = rng(Math.floor(Math.random() * 1e6));
  const libre = (x, y, d, list) => list.every(o => Math.hypot(o.x - x, o.y - y) > d + (o.r || 0));
  const all = [], arena = [], rocas = [], obj = [];
  const put = (arr, n, rad, d) => { let g = 0; while (arr.length < n && g++ < 400) { const x = 140 + r() * (W - 180), y = 40 + r() * (H - 80); if (libre(x, y, d, all)) { const o = { x, y, r: rad() }; arr.push(o); all.push(o); } } };
  put(obj, 3, () => 14, 40); while (obj.length < 3) obj.push({ x: 200 + r() * 460, y: 50 + r() * (H - 100), r: 14 }); put(arena, sp.arena || 4, () => 30 + r() * 22, 30); put(rocas, 7, () => 9 + r() * 10, 18);
  obj.forEach(o => { o.p = 0; o.ok = false; });
  const rov = { x: 50, y: H / 2, a: 0 }, VEL = sp.lrv ? 120 : sp.lento ? 45 : 70;
  let bat = 100, dist = 0, atasco = 0, n = 0;
  const inSand = (x, y) => arena.some(s => ((x - s.x) / (s.r * 1.4)) ** 2 + ((y - s.y) / s.r) ** 2 < 1);
  const rr = rng(5), motas = [...Array(220)].map(() => [rr() * W, rr() * H, rr()]);
  function draw(t) {
    c.fillStyle = m.suelo; c.fillRect(0, 0, W, H);
    motas.forEach(([x, y, k]) => { c.fillStyle = k < .5 ? m.suelo2 : 'rgba(255,255,255,.08)'; c.fillRect(x, y, 2, 2); });
    arena.forEach(s => { c.fillStyle = 'rgba(40,20,10,.35)'; c.beginPath(); c.ellipse(s.x, s.y, s.r * 1.4, s.r, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.12)'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(s.x, s.y + k * 6, s.r * 1.1, 3, 0, 0, Math.PI); c.stroke(); } });
    rocas.forEach(o => { c.fillStyle = m.suelo2; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(o.x - o.r * .3, o.y - o.r * .3, o.r * .4, 0, 7); c.fill(); });
    obj.forEach(o => {
      if (sp.look === 'bayas') { const q = rng(Math.floor(o.x)); for (let i = 0; i < 9; i++) { c.fillStyle = '#4a5068'; c.beginPath(); c.arc(o.x + (q() - .5) * 22, o.y + (q() - .5) * 22, 3, 0, 7); c.fill(); } }
      else { c.fillStyle = { blanco: '#f1eee6', naranja: '#e8873a', amarillo: '#e2c94a', roca: '#c9c3b6' }[sp.look] || '#c9c3b6'; c.beginPath(); c.ellipse(o.x, o.y, 13, 10, .4, 0, 7); c.fill(); }
      c.strokeStyle = o.ok ? '#80dcc6' : 'rgba(255,184,77,' + (.5 + .5 * Math.sin(t * 4)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(o.x, o.y, 22, 0, 7); c.stroke();
      if (o.p > 0 && !o.ok) { c.strokeStyle = '#ffb84d'; c.lineWidth = 4; c.beginPath(); c.arc(o.x, o.y, 27, -Math.PI / 2, -Math.PI / 2 + o.p * Math.PI * 2); c.stroke(); }
    });
    c.save(); c.translate(rov.x, rov.y); c.rotate(rov.a);
    c.fillStyle = '#20263a'; [-10, 0, 10].forEach(dx => { c.fillRect(dx - 3, -13, 7, 5); c.fillRect(dx - 3, 8, 7, 5); });
    if (!sp.lrv) { c.fillStyle = '#2b4a8a'; c.fillRect(-12, -18, 22, 5); c.fillRect(-12, 13, 22, 5); }
    c.fillStyle = sp.lrv ? '#c9c3b6' : '#e9e4d8'; c.fillRect(-14, -9, 28, 18); c.fillStyle = '#ffb84d'; c.beginPath(); c.moveTo(16, 0); c.lineTo(9, -5); c.lineTo(9, 5); c.fill();
    c.restore();
    if (atasco > 0) { c.fillStyle = '#ff8a7a'; c.font = 'bold 14px "IBM Plex Mono", monospace'; c.fillText('¡Atascándose en la arena!', 14, 24); }
  }
  UI.run((dt, t) => {
    const I = UI.inp; if (I.l) rov.a -= 2.4 * dt; if (I.r) rov.a += 2.4 * dt;
    const mov = (I.f ? 1 : 0) - (I.b ? .6 : 0), sand = inSand(rov.x, rov.y);
    if (mov) {
      const sp2 = VEL * mov * (sand ? .18 : 1) * dt, nx = rov.x + Math.cos(rov.a) * sp2, ny = rov.y + Math.sin(rov.a) * sp2;
      if (nx > 12 && nx < W - 12 && ny > 12 && ny < H - 12 && rocas.every(o => Math.hypot(o.x - nx, o.y - ny) > o.r + 12)) { rov.x = nx; rov.y = ny; dist += Math.abs(sp2) / 10; }
      bat -= (sp.lrv ? 2 : sp.rtg ? 1.6 : 2.6) * dt;
    } else bat += (solar ? 5 : -0.3) * dt;
    bat = Math.min(100, bat);
    if (sand && mov) atasco += dt; else atasco = Math.max(0, atasco - dt);
    if (atasco > 2) { draw(t); return UI.fail('Te quedaste atascado en arena blanda, como Spirit en 2009. Rodea las zonas oscuras.'); }
    obj.forEach(o => { if (o.ok) return; const cerca = Math.hypot(o.x - rov.x, o.y - rov.y) < 26;
      if (cerca && !mov) { o.p += dt / 1.3; if (o.p >= 1) { o.ok = true; n++; beep(880, .12); } } else o.p = Math.max(0, o.p - dt); });
    draw(t); UI.set('b', Math.max(0, bat).toFixed(0)); UI.set('n', n + ' / 3'); UI.set('d', num(dist));
    if (n === 3) return UI.done('¡Analizaste ' + sp.obj + '!', cur.name + ': ' + sp.obj + ' analizadas. Así se lee la historia de un mundo.');
    if (bat <= 0) return UI.fail('Te quedaste sin batería. ' + (solar ? 'Detente de vez en cuando: los paneles solares se recargan con el rover quieto.' : 'Elige un camino más corto.'));
  });
}

/* ---------- CAVAR (pala) ---------- */
function gCavar(sp) {
  const m = MUNDO[sp.w], hielo = sp.obj === 'hielo', COL = 8, PROF = hielo ? 2 : 3;
  const UI = gameFrame({
    hint: sp.hint + ' Mueve el brazo con ◀ ▶ y pulsa <strong>Cavar</strong>. Los bultos en la superficie avisan de rocas escondidas.',
    hud: [['p', 'Profundidad', 'cm'], ['i', 'Intentos', '']],
    btns: [{ id: 'l', label: '◀', aria: 'Mover el brazo a la izquierda', ghost: 1, keys: ['ArrowLeft', 'a'], click: () => { col = Math.max(0, col - 1); } },
      { id: 'c', label: 'Cavar', keys: [' ', 'ArrowDown', 's'], click: () => cavar() },
      { id: 'r', label: '▶', aria: 'Mover el brazo a la derecha', ghost: 1, keys: ['ArrowRight', 'd'], click: () => { col = Math.min(COL - 1, col + 1); } }]
  });
  const c = UI.c, W = UI.W, H = UI.H, top = 170, cw = W / COL, capa = 50, r = rng(Math.floor(Math.random() * 1e6));
  const roca = [...Array(COL)].map(() => (r() < .45 ? 1 + Math.floor(r() * PROF) : 0)); if (roca.every(x => x)) roca[Math.floor(r() * COL)] = 0;
  const pista = roca.map(x => x && r() < .85), prof = Array(COL).fill(0), bloq = Array(COL).fill(false);
  let col = 0, tries = 3, fin = null, tFin = 0;
  function cavar() {
    if (fin || bloq[col]) { if (bloq[col]) UI.say('Aquí hay una roca. Prueba en otro lugar.'); return; }
    prof[col]++; beep(300, .05);
    if (roca[col] && prof[col] >= roca[col]) { bloq[col] = true; tries--; UI.say('¡Roca! La pala no puede seguir aquí. Te quedan ' + tries + ' intentos.', false); if (!tries) UI.fail('Chocaste con rocas demasiadas veces. Fíjate en los bultos de la superficie.'); return; }
    if (prof[col] >= PROF) { fin = col; tFin = 0; UI.say(hielo ? '¡Algo blanco! Míralo durante unos días marcianos…' : '¡Muestra de suelo limpia! Llevándola al laboratorio…', true); }
  }
  function draw() {
    cieloYSuelo(c, W, H, m, top, 4);
    for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? m.suelo : m.suelo2; c.globalAlpha = .55; c.fillRect(0, top + k * capa, W, capa); c.globalAlpha = 1; }
    for (let i = 0; i < COL; i++) {
      const x = i * cw;
      if (pista[i]) { c.fillStyle = m.suelo2; c.beginPath(); c.ellipse(x + cw / 2, top, 14, 7, 0, Math.PI, 0); c.fill(); }
      if (prof[i]) {
        c.fillStyle = '#1a1210'; c.fillRect(x + 14, top, cw - 28, prof[i] * capa);
        if (roca[i] && prof[i] >= roca[i]) { c.fillStyle = '#5e5650'; c.beginPath(); c.ellipse(x + cw / 2, top + roca[i] * capa - 8, cw / 2 - 12, 16, 0, 0, 7); c.fill(); }
        if (fin === i && hielo) { const a = Math.max(0, 1 - tFin / 3.5); c.fillStyle = 'rgba(240,248,255,' + a + ')'; for (let k = 0; k < 5; k++) c.fillRect(x + 18 + k * 10, top + prof[i] * capa - 10, 7 * a + 1, 7 * a + 1); }
      }
    }
    c.fillStyle = '#a3acce'; c.font = '12px "IBM Plex Mono", monospace';
    for (let k = 1; k <= 3; k++) c.fillText((k * (hielo ? 2.5 : 5)) + ' cm', W - 60, top + k * capa - 4);
    const ax = col * cw + cw / 2, ay = top + prof[col] * capa - 6;
    c.strokeStyle = '#ece7da'; c.lineWidth = 6; c.beginPath(); c.moveTo(40, 40); c.lineTo(ax - 30, 70); c.lineTo(ax, Math.max(top - 30, ay - 20)); c.stroke();
    c.fillStyle = '#ffb84d'; c.fillRect(ax - 12, Math.max(top - 30, ay - 20), 24, 12);
    c.fillStyle = '#e9e4d8'; c.fillRect(10, 26, 60, 26);
    if (fin !== null && hielo) { c.fillStyle = '#ece7da'; c.font = 'bold 16px "IBM Plex Mono", monospace'; c.fillText('Sol ' + (20 + Math.floor(tFin * 1.2)), W / 2 - 30, 40); }
  }
  UI.run(dt => {
    draw(); UI.set('p', num(prof[col] * (hielo ? 2.5 : 5), 1)); UI.set('i', String(tries));
    if (fin !== null) { tFin += dt; if (tFin > 4) return UI.done(hielo ? 'El hielo pasó directamente a vapor: así supimos que era hielo de agua y no sal.' : 'Muestra entregada al laboratorio.', cur.name + ': ' + (hielo ? 'hielo de agua confirmado.' : 'muestra de suelo analizada.')); }
  });
}

/* ---------- PERFORAR ---------- */
function gPerforar(sp) {
  const m = MUNDO[sp.w], META = sp.meta;
  const UI = gameFrame({ hint: sp.hint + ' Mantén <strong>Perforar</strong> (o la barra espaciadora). Las capas duras calientan más el taladro: suelta para que se enfríe.',
    hud: [['p', 'Profundidad', 'cm'], ['q', 'Temperatura', '%']], btns: [{ id: 'd', label: 'Perforar (mantén)', hold: 1, keys: [' ', 'ArrowDown', 's'] }], canvasHold: 'd' });
  const c = UI.c, W = UI.W, H = UI.H, top = 120, esc = (H - top - 20) / META, r = rng(Math.floor(Math.random() * 1e6));
  const capas = []; let y = 0; while (y < META) { const g = 12 + r() * 30; capas.push({ a: y, b: y + g, dur: 1 + Math.floor(r() * 3) }); y += g; }
  const durA = p => (capas.find(k => p >= k.a && p < k.b) || { dur: 1 }).dur;
  let p = 0, calor = 0;
  UI.run(dt => {
    const d = durA(p);
    if (UI.inp.d) { p += 26 / d * dt; calor += 9 * d * dt; } else calor -= 22 * dt;
    calor = Math.max(0, calor);
    cieloYSuelo(c, W, H, m, top, 6);
    capas.forEach(k => { c.fillStyle = k.dur === 3 ? '#5a534c' : k.dur === 2 ? m.suelo2 : m.suelo; c.fillRect(0, top + k.a * esc, W, (k.b - k.a) * esc + 1); });
    c.fillStyle = '#d6d0c4'; c.fillRect(220, top - 70, 70, 50); c.fillStyle = '#ece7da'; c.fillRect(250, top - 20, 10, 20 + p * esc);
    c.fillStyle = calor > 70 ? '#ff8a7a' : '#ffb84d'; c.beginPath(); c.moveTo(250, top + p * esc); c.lineTo(260, top + p * esc); c.lineTo(255, top + p * esc + 10); c.fill();
    c.fillStyle = '#a3acce'; c.font = '12px "IBM Plex Mono", monospace';
    for (let k = 0; k <= META; k += 25) { c.fillRect(W - 70, top + k * esc, 10, 1); c.fillText(k + ' cm', W - 56, top + k * esc + 4); }
    c.strokeStyle = '#80dcc6'; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(200, top + META * esc); c.lineTo(W - 80, top + META * esc); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(40, 30, 140, 14); c.fillStyle = calor > 70 ? '#ff8a7a' : '#ffb84d'; c.fillRect(40, 30, 1.4 * Math.min(100, calor), 14);
    c.fillStyle = '#ece7da'; c.fillText('calor del taladro', 40, 60);
    UI.set('p', Math.min(META, p).toFixed(0)); UI.set('q', Math.min(100, calor).toFixed(0));
    if (calor >= 100) return UI.fail('El taladro se recalentó y se atascó. Perfora a ratos en las capas duras (las más oscuras).');
    if (p >= META) return UI.done('¡Llegaste a ' + META + ' cm! Las capas de la columna cuentan la historia del suelo.', cur.name + ': columna de suelo recuperada.');
  });
}

/* ---------- SISMOS ---------- */
function gSismos(sp) {
  const marte = sp.w === 'marte', DEC = sp.campana ? 3.2 : .9;
  const UI = gameFrame({ hint: sp.hint + ' Un sismo empieza con una onda pequeña (P) y después llega una grande (S) que se apaga poco a poco. ' + (marte ? 'El viento es un ruido desordenado.' : 'Los ruidos del propio módulo son golpecitos regulares.') + ' Pulsa <strong>¡Sismo!</strong> cuando veas uno.',
    hud: [['s', 'Sismos', ''], ['v', 'Vidas', '']], btns: [{ id: 's', label: '¡Sismo!', keys: [' ', 'Enter'], click: () => marcar() }], h: 300 });
  const c = UI.c, W = UI.W, H = UI.H, PX = 90, ev = []; let tt = 0, prox = 1.5, ok = 0, vidas = 3;
  function programar() { const q = Math.random() < .5; ev.push({ tipo: q ? 'q' : (marte ? 'viento' : 'tic'), t: tt + .1, dur: q ? 1 + DEC * 3 : 2.2, hecho: false }); }
  const sig = t => {
    let s = .035 * (Math.sin(t * 97) + .7 * Math.sin(t * 151.3) + .5 * Math.sin(t * 233.7));
    ev.forEach(e => { const u = t - e.t; if (u < 0 || u > e.dur) return;
      if (e.tipo === 'q') { s += u < .7 ? .22 * Math.sin(2 * Math.PI * 9 * u) : Math.min(1, (u - .7) / .25) * Math.exp(-(u - .95) / DEC) * .95 * Math.sin(2 * Math.PI * 5 * u); }
      else if (e.tipo === 'viento') { const env = Math.sin(Math.PI * u / e.dur) * (.6 + .4 * Math.sin(u * 7.3)); s += .55 * env * (Math.sin(t * 61.7) + Math.sin(t * 143.1) * .8 + Math.sin(t * 211.9) * .6) / 2; }
      else { const ph = (u % .45); s += ph < .12 ? .7 * Math.sin(Math.PI * ph / .12) : 0; } });
    return s;
  };
  function marcar() {
    const visto = ev.find(e => e.tipo === 'q' && !e.hecho && tt >= e.t + .3 && tt <= e.t + e.dur + 1.5);
    if (visto) { visto.hecho = true; ok++; beep(880, .12); UI.say('¡Bien! Eso era un sismo.', true); }
    else { vidas--; beep(180, .2); UI.say(marte ? 'Eso no era un sismo: era viento.' : 'Eso no era un sismo.', false); }
  }
  UI.run(dt => {
    tt += dt; prox -= dt; if (prox <= 0) { programar(); prox = 2.6 + Math.random() * 1.6; }
    ev.forEach(e => { if (e.tipo === 'q' && !e.hecho && !e.perdido && tt > e.t + e.dur + 1.5) { e.perdido = true; vidas--; UI.say('Se te escapó un sismo.', false); } });
    c.fillStyle = '#050a10'; c.fillRect(0, 0, W, H); c.strokeStyle = '#1d2a3d'; c.lineWidth = 1;
    for (let x = 0; x < W; x += PX) { c.beginPath(); c.moveTo(x - (tt * PX) % PX + PX, 0); c.lineTo(x - (tt * PX) % PX + PX, H); c.stroke(); }
    c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
    c.strokeStyle = '#ffb84d'; c.lineWidth = 2; c.beginPath();
    for (let x = 0; x <= W; x += 2) { const y = H / 2 - sig(tt - (W - x) / PX) * (H * .42); x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
    c.fillStyle = '#a3acce'; c.font = '12px "IBM Plex Mono", monospace'; c.fillText('ahora →', W - 64, 16); c.fillText('1 s', 8, H - 8);
    UI.set('s', ok + ' / 3'); UI.set('v', String(Math.max(0, vidas)));
    if (ok >= 3) return UI.done(sp.campana ? 'Tres temblores. En la Luna duran tanto porque su corteza seca y rota hace rebotar las ondas.' : 'Tres marsmotos. Con más de 1.300 así, InSight midió el núcleo de Marte.', cur.name + ': sismos registrados. Así se ve un planeta por dentro.');
    if (vidas <= 0) return UI.fail('Se acabaron las vidas. Recuerda: primero una onda pequeña, después una grande que se apaga despacio.');
  });
}

/* ---------- HELICÓPTERO (Ingenuity) ---------- */
function gHelicoptero() {
  const G = 3.71, RPMMAX = 3400;
  const UI = gameFrame({ hint: 'El 19 de abril de 2021 hice el primer vuelo con motor en otro planeta: subí a 3 m, me mantuve en el aire y aterricé. El aire de Marte es tan delgado que mis hélices giran unas 2.400 veces por minuto. <strong>Mantén «Potencia» para acelerar las hélices: sube a la franja de 3 m, quédate 5 segundos y aterriza suave.</strong>',
    hud: [['a', 'Altura', 'm'], ['v', 'Velocidad', 'm/s'], ['r', 'Hélices', 'rpm'], ['t', 'Batería', 's']], btns: [{ id: 'p', label: 'Potencia (mantén)', hold: 1, keys: [' ', 'ArrowUp', 'w'] }], canvasHold: 'p' });
  const c = UI.c, W = UI.W, H = UI.H, suelo = 360, PXM = 50;
  let alt = 0, vy = 0, rpm = 0, bat = 60, fase = 0, hold = 0, despego = false;
  const FASES = ['Sube hasta la franja verde (2,5–3,5 m)', 'Mantente en la franja', 'Ahora aterriza suave (menos de 1 m/s)'];
  UI.run((dt, t) => {
    const obj = UI.inp.p ? RPMMAX : 0; rpm += (obj - rpm) * Math.min(1, dt * 1.6); bat -= dt;
    let acc = 2 * G * (rpm / RPMMAX) ** 2 - G; if (alt <= 0 && acc < 0) { acc = 0; vy = Math.max(0, vy); }
    vy += acc * dt; alt += vy * dt;
    if (alt > .3) despego = true;
    if (alt <= 0) { alt = 0; if (despego) { if (vy < -1.5) return UI.fail('Golpeaste el suelo a ' + num(-vy) + ' m/s. Baja soltando y apretando poco a poco.'); if (fase === 2 && vy >= -1) return UI.done('¡Vuelo completo! Igual que mi primer vuelo: unos 39 segundos en el aire de otro planeta.', 'Ingenuity: primer vuelo en otro planeta repetido. Después hizo 71 más.'); if (fase < 2 && despego) { /* tocó suelo antes de tiempo */ } } vy = 0; }
    if (fase === 0 && alt >= 2.5 && alt <= 3.5) fase = 1;
    if (fase === 1) { if (alt >= 2.5 && alt <= 3.5) { hold += dt; if (hold >= 5) fase = 2; } else hold = Math.max(0, hold - dt * .5); }
    if (alt > 7) return UI.fail('Subiste demasiado alto. En el primer vuelo el plan era solo 3 m.');
    if (bat <= 0) return UI.fail('Se acabó la batería. Ingenuity recargaba sus baterías con un panel solar entre vuelos.');
    const sky = c.createLinearGradient(0, 0, 0, suelo); sky.addColorStop(0, '#3b2a2c'); sky.addColorStop(1, '#c39466'); c.fillStyle = sky; c.fillRect(0, 0, W, suelo);
    c.fillStyle = '#b5623a'; c.fillRect(0, suelo, W, H - suelo);
    c.fillStyle = 'rgba(128,220,198,.15)'; c.fillRect(0, suelo - 3.5 * PXM, W, PXM);
    c.fillStyle = '#ece7da'; c.font = '12px "IBM Plex Mono", monospace'; for (let k = 1; k <= 6; k++) c.fillText(k + ' m', 8, suelo - k * PXM + 4);
    c.fillStyle = '#d8d2c6'; c.fillRect(70, suelo - 46, 90, 36); c.fillRect(90, suelo - 70, 8, 24); [80, 115, 150].forEach(x => { c.fillStyle = '#20263a'; c.beginPath(); c.arc(x, suelo - 8, 9, 0, 7); c.fill(); });
    c.fillStyle = '#ece7da'; c.fillText('Perseverance', 70, suelo + 22);
    const x = 420, y = suelo - alt * PXM;
    if (alt < 1.2 && rpm > 1500) { c.fillStyle = 'rgba(200,140,100,' + (.4 * (1.2 - alt)) + ')'; c.beginPath(); c.ellipse(x, suelo, 70, 10, 0, 0, 7); c.fill(); }
    c.strokeStyle = '#c9c3b6'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 14, y - 4); c.lineTo(x - 22, y + 14); c.moveTo(x + 14, y - 4); c.lineTo(x + 22, y + 14); c.stroke();
    c.fillStyle = '#d4a017'; c.fillRect(x - 12, y - 18, 24, 16); c.fillStyle = '#20263a'; c.fillRect(x - 2, y - 40, 4, 22);
    const w = 52 * Math.abs(Math.cos(t * rpm / 60)); c.fillStyle = 'rgba(236,231,218,' + (rpm > 300 ? .55 : .9) + ')'; c.fillRect(x - w, y - 40, w * 2, 3); c.fillRect(x - (52 - w * .4), y - 32, (52 - w * .4) * 2, 3);
    c.fillStyle = '#ece7da'; c.font = 'bold 14px "IBM Plex Mono", monospace'; c.fillText(FASES[fase] + (fase === 1 ? ' · ' + num(Math.max(0, 5 - hold)) + ' s' : ''), 200, 30);
    UI.set('a', num(alt, 2)); UI.set('v', num(vy)); UI.set('r', Math.round(rpm).toLocaleString('es-ES')); UI.set('t', Math.max(0, bat).toFixed(0));
  });
}

/* ---------- TRÁNSITO (Kepler) ---------- */
function gTransito() {
  const P = 3.4, DUR = .7, PROF = .01;
  const UI = gameFrame({ hint: 'Miraba 150.000 estrellas esperando pequeños apagones: cuando un planeta pasa delante, la estrella brilla un poquito menos. <strong>Pulsa «¡Tránsito!» cada vez que la curva baje.</strong> Los falsos avisos cuestan vidas: el brillo siempre tiembla un poco.',
    hud: [['n', 'Tránsitos', ''], ['v', 'Vidas', '']], btns: [{ id: 'x', label: '¡Tránsito!', keys: [' ', 'Enter'], click: () => marcar() }], h: 340 });
  const c = UI.c, W = UI.W, H = UI.H, PX = 80, fase0 = 2.2; let tt = 0, n = 0, vidas = 3; const hechos = new Set();
  const dip = t => { const k = Math.floor((t - fase0) / P), u = t - fase0 - k * P; return (t >= fase0 && u < DUR) ? k : -1; };
  const flujo = t => 1 - (dip(t) >= 0 ? PROF * Math.sin(Math.PI * ((t - fase0) % P) / DUR) ** .5 : 0) + .0022 * (Math.sin(t * 37) + Math.sin(t * 91.3) * .7 + Math.sin(t * 17.1) * .5);
  function marcar() {
    let k = dip(tt); if (k < 0) k = dip(tt - .45);
    if (k >= 0 && !hechos.has(k)) { hechos.add(k); n++; beep(880, .12); UI.say('¡Tránsito! La estrella perdió un 1 % de brillo.', true); }
    else { vidas--; beep(180, .2); UI.say('Eso era solo el temblor normal de la estrella.', false); }
  }
  UI.run(dt => {
    tt += dt; c.fillStyle = '#050a10'; c.fillRect(0, 0, W, H);
    const f = flujo(tt), g = c.createRadialGradient(110, 110, 4, 110, 110, 70);
    g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.5, 'rgba(255,200,120,' + (.9 - (1 - f) * 20) + ')'); g.addColorStop(1, 'rgba(255,170,80,0)');
    c.fillStyle = g; c.beginPath(); c.arc(110, 110, 70, 0, 7); c.fill();
    c.fillStyle = '#a3acce'; c.font = '12px "IBM Plex Mono", monospace'; c.fillText('estrella', 85, 200);
    const y0 = 60, y1 = 300, v2y = v => y0 + (1.004 - v) / .018 * (y1 - y0);
    c.strokeStyle = '#1d2a3d'; [1, .99].forEach(v => { c.beginPath(); c.moveTo(220, v2y(v)); c.lineTo(W, v2y(v)); c.stroke(); c.fillText((v * 100).toFixed(0) + ' %', 225, v2y(v) - 4); });
    c.strokeStyle = '#ffb84d'; c.lineWidth = 2; c.beginPath();
    for (let x = 220; x <= W; x += 2) { const y = v2y(flujo(tt - (W - x) / PX)); x === 220 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    c.fillText('brillo', 225, 40);
    UI.set('n', n + ' / 3'); UI.set('v', String(vidas));
    if (n >= 3) return UI.done('Tres apagones iguales cada ' + num(P) + ' s: ¡un planeta en órbita! En la realidad se repiten cada pocos días, meses o años.', 'Kepler: planeta descubierto. Encontró más de 2.600 así.');
    if (vidas <= 0) return UI.fail('Se acabaron las vidas. Espera a que la curva baje de verdad, hasta la línea del 99 %.');
  });
}

/* ---------- CINTURÓN DE ASTEROIDES (Pioneer 10) ---------- */
function gCinturon() {
  const UI = gameFrame({ hint: 'En 1972 nadie sabía si se podía cruzar el cinturón de asteroides. Fui la primera nave en intentarlo. <strong>Sube y baja para esquivar las rocas hasta llegar a Júpiter.</strong> En la realidad hay millones de kilómetros entre roca y roca; aquí las juntamos para jugar.',
    hud: [['p', 'Cruce', '%'], ['e', 'Escudo', '']], btns: [{ id: 'u', label: '▲ Subir', hold: 1, keys: ['ArrowUp', 'w'] }, { id: 'd', label: '▼ Bajar', hold: 1, keys: ['ArrowDown', 's'] }] });
  const c = UI.c, W = UI.W, H = UI.H, DUR = 24, rocas = [], st = [...Array(90)].map(() => [Math.random() * W, Math.random() * H, Math.random()]);
  let y = H / 2, tt = 0, esc = 3, inv = 0, sp = 0;
  UI.run(dt => {
    tt += dt; inv -= dt; if (UI.inp.u) y -= 170 * dt; if (UI.inp.d) y += 170 * dt; y = Math.max(20, Math.min(H - 20, y));
    sp -= dt; if (tt < DUR && sp <= 0) { rocas.push({ x: W + 30, y: 20 + Math.random() * (H - 40), r: 8 + Math.random() * 16, v: 150 + Math.random() * 140 }); sp = .28 + Math.random() * .3; }
    c.fillStyle = '#04070d'; c.fillRect(0, 0, W, H);
    st.forEach(s => { s[0] -= 20 * s[2] * dt; if (s[0] < 0) s[0] += W; c.fillStyle = 'rgba(255,255,255,' + (.2 + s[2] * .5) + ')'; c.fillRect(s[0], s[1], 1.5, 1.5); });
    if (tt > DUR - 4) { const jx = W + 140 - (tt - DUR + 4) * 80; const g = c.createLinearGradient(0, H / 2 - 150, 0, H / 2 + 150); ['#d8b48a', '#b07a50', '#e6cfae', '#a86e48', '#d8b48a'].forEach((col, i) => g.addColorStop(i / 4, col)); c.fillStyle = g; c.beginPath(); c.arc(Math.max(560, jx), H / 2, 150, 0, 7); c.fill(); }
    rocas.forEach(o => { o.x -= o.v * dt; c.fillStyle = '#8a7a6a'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(o.x - o.r * .3, o.y - o.r * .3, o.r * .4, 0, 7); c.fill();
      if (inv <= 0 && Math.hypot(o.x - 110, o.y - y) < o.r + 12) { esc--; inv = 1.2; beep(150, .2); UI.say('¡Choque! El escudo resistió.', false); } });
    for (let i = rocas.length - 1; i >= 0; i--) if (rocas[i].x < -40) rocas.splice(i, 1);
    if (inv <= 0 || Math.floor(inv * 10) % 2) { c.save(); c.translate(110, y); c.fillStyle = '#ece7da'; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); c.strokeStyle = '#ece7da'; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, 0); c.lineTo(-22, -10); c.moveTo(-4, 0); c.lineTo(-22, 10); c.stroke(); c.fillStyle = '#ffb84d'; c.fillRect(8, -2, 10, 4); c.restore(); }
    UI.set('p', Math.min(100, tt / DUR * 100).toFixed(0)); UI.set('e', '●'.repeat(Math.max(0, esc)) || '0');
    if (esc <= 0) return UI.fail('El escudo no aguantó. Muévete pronto: las rocas grandes son las más lentas.');
    if (tt >= DUR + 1.5) return UI.done('¡Cruzaste el cinturón y llegaste a Júpiter, como en diciembre de 1973!', 'Pioneer 10: primera nave en cruzar el cinturón de asteroides y en visitar Júpiter.');
  });
}

/* ---------- MOTOR DE IONES (Dawn) ---------- */
function gIones() {
  const UI = gameFrame({ hint: 'Mi motor de iones empuja con la fuerza de una hoja de papel, pero sin parar. Así viajé de Vesta a Ceres en unos dos años y medio. <strong>Usa el motor para cambiar de órbita y llegar justo cuando pase Ceres.</strong> Cuanto más cerca del Sol, más rápido das la vuelta. Pista: enciende el motor cuando Ceres esté unos 90° por delante.',
    hud: [['x', 'Xenón', '%'], ['d', 'Distancia a Ceres', '°']], btns: [{ id: 'i', label: '◀ Hacia el Sol', hold: 1, ghost: 1, keys: ['ArrowDown', 's', 'ArrowLeft', 'a'] }, { id: 'o', label: 'Hacia afuera ▶', hold: 1, keys: ['ArrowUp', 'w', 'ArrowRight', 'd', ' '] }] });
  const c = UI.c, W = UI.W, H = UI.H, cx = 360, cy = 210, R1 = 100, R2 = 180, K = .8 * R1 ** 1.5;
  let r = R1, a = 0, ac = 2.3, xe = 100, sinX = 0; const rastro = [];
  const om = rr => K / rr ** 1.5, ang = d => { d = (d + Math.PI) % (2 * Math.PI); if (d < 0) d += 2 * Math.PI; return d - Math.PI; };
  UI.run(dt => {
    const mot = (UI.inp.o ? 1 : 0) - (UI.inp.i ? 1 : 0);
    if (mot && xe > 0) { r += mot * 9 * dt; xe = Math.max(0, xe - 6 * dt); }
    r = Math.max(70, Math.min(200, r)); a += om(r) * dt; ac += om(R2) * dt;
    rastro.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); if (rastro.length > 260) rastro.shift();
    const d = ang(ac - a);
    c.fillStyle = '#04070d'; c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(cx, cy, 2, cx, cy, 30); g.addColorStop(0, '#fff3c4'); g.addColorStop(.5, '#ffb84d'); g.addColorStop(1, 'rgba(255,184,77,0)'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 30, 0, 7); c.fill();
    c.strokeStyle = 'rgba(163,172,206,.35)'; c.setLineDash([4, 6]); [R1, R2].forEach(rr => { c.beginPath(); c.arc(cx, cy, rr, 0, 7); c.stroke(); }); c.setLineDash([]);
    c.fillStyle = '#a3acce'; c.font = '12px "IBM Plex Mono", monospace'; c.fillText('órbita de Vesta', cx + R1 * .7, cy + R1 * .75); c.fillText('órbita de Ceres', cx + R2 * .7 + 6, cy + R2 * .75);
    c.strokeStyle = 'rgba(128,220,198,.5)'; c.beginPath(); rastro.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    c.fillStyle = '#9a948a'; c.beginPath(); c.arc(cx + Math.cos(ac) * R2, cy + Math.sin(ac) * R2, 9, 0, 7); c.fill(); c.fillStyle = '#ece7da'; c.fillText('Ceres', cx + Math.cos(ac) * R2 + 12, cy + Math.sin(ac) * R2);
    const dx = cx + Math.cos(a) * r, dy = cy + Math.sin(a) * r; c.fillStyle = '#d4a017'; c.fillRect(dx - 4, dy - 4, 8, 8); c.fillStyle = '#2b4a8a'; c.fillRect(dx - 14, dy - 2, 28, 4);
    if (mot && xe > 0) { c.fillStyle = 'rgba(120,170,255,.9)'; c.beginPath(); c.arc(dx - Math.cos(a + Math.PI / 2) * 10, dy - Math.sin(a + Math.PI / 2) * 10, 4, 0, 7); c.fill(); }
    UI.set('x', xe.toFixed(0)); UI.set('d', Math.abs(d * 180 / Math.PI).toFixed(0));
    if (Math.abs(r - R2) < 8 && Math.abs(d) < .35) return UI.done('¡Ceres te atrapó en órbita! Dawn llegó en marzo de 2015 y fue la primera nave en orbitar dos mundos lejanos.', 'Dawn: viaje de Vesta a Ceres completado.');
    if (xe <= 0) { sinX += dt; if (sinX > 4) return UI.fail('Se acabó el xenón. Pista: espera en la órbita de adentro (vas más rápido) y sube cuando Ceres esté un poco adelante.'); }
  });
}

/* ---------- IMPACTO (Luna 2) ---------- */
function gImpacto() {
  const UI = gameFrame({ hint: 'La Luna se mueve en su órbita mientras la sonda viaja hacia ella. Luna 1 apuntó mal y pasó de largo. <strong>Pulsa «Lanzar» para que la sonda llegue justo cuando pase la Luna.</strong> Apunta a donde estará, no a donde está.',
    hud: [['n', 'Intentos', '']], btns: [{ id: 'l', label: 'Lanzar', keys: [' ', 'Enter'], click: () => lanzar() }], h: 380 });
  const c = UI.c, W = UI.W, H = UI.H, ex = 90, cy = H / 2, mx = 600, VY = 70, VP = 250; let my = H + 40, pr = null, n = 0, res = 0;
  function lanzar() { if (pr) return; pr = { x: ex + 40 }; n++; beep(900, .08); }
  UI.run(dt => {
    my -= VY * dt; if (my < -40) my = H + 40;
    c.fillStyle = '#04070d'; c.fillRect(0, 0, W, H); const r = rng(2); for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(r() * W, r() * H, 1, 1); }
    c.strokeStyle = 'rgba(163,172,206,.3)'; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(mx, 0); c.lineTo(mx, H); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#3d6fd1'; c.beginPath(); c.arc(ex, cy, 38, 0, 7); c.fill(); c.fillStyle = '#4f9a6a'; c.beginPath(); c.ellipse(ex - 8, cy - 6, 15, 10, 0, 0, 7); c.fill();
    c.fillStyle = '#bdbab3'; c.beginPath(); c.arc(mx, my, 26, 0, 7); c.fill();
    c.fillStyle = '#a3acce'; c.font = '12px "IBM Plex Mono", monospace'; c.fillText('Tierra', ex - 20, cy + 56); c.fillText('órbita de la Luna', mx + 8, 16);
    if (pr) {
      pr.x += VP * dt; c.fillStyle = '#ffb84d'; c.beginPath(); c.arc(pr.x, cy, 5, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,184,77,.3)'; c.beginPath(); c.moveTo(ex + 40, cy); c.lineTo(pr.x, cy); c.stroke();
      if (pr.x >= mx - 26 && Math.abs(my - cy) < 28) return UI.done('¡Impacto! El 13 de septiembre de 1959 Luna 2 fue el primer objeto humano en llegar a la Luna.', 'Luna 2: primer objeto humano en tocar la Luna.');
      if (pr.x > W) { pr = null; UI.say('Pasaste de largo, como Luna 1. Lanza antes de que la Luna llegue a tu línea.', false); beep(180, .2); }
    }
    UI.set('n', String(n));
  });
}

function win(msg) {
  const it = cur, first = !archived.has(it.id);
  archived.add(it.id); save(); renderMeter(); setPhase(3);
  beep(660, .15); setTimeout(() => beep(990, .25), 150);
  const box = document.createElement('div'); box.className = 'rx-archived'; box.setAttribute('role', 'status');
  const st = document.createElement('strong'); st.textContent = first ? tx('Eco archivado', 'Echo archived') : tx('Ya estaba en el archivo', 'Already in the archive');
  const m = document.createElement('div'); m.textContent = msg; box.append(st, m); body.appendChild(box);
  const a = document.createElement('div'); a.className = 'rx-actions';
  const b1 = document.createElement('button'); b1.className = 'rx-btn'; b1.type = 'button'; b1.textContent = tx('Seguir volando', 'Keep flying'); b1.onclick = closeEcho;
  const b2 = document.createElement('button'); b2.className = 'rx-btn ghost'; b2.type = 'button'; b2.textContent = tx('Ver el archivo', 'Open the archive');
  b2.onclick = () => { closeEcho(); window.toggleSitesPanel(); };
  a.append(b1, b2); body.appendChild(a); b1.focus();
  if (first) {
    const left = TOTAL - archived.size;
    setTimeout(() => triggerEveMessage(left ? tx('📡 ¡Guardaste el eco de ' + it.name + '! Quedan ' + left + ' por encontrar.', '📡 You saved the echo of ' + it.name + '! ' + left + ' left to find.')
      : tx('🏆 ¡Archivo completo! Recuperaste todas las historias. Estas máquinas ya no se mueven, pero lo que descubrieron sigue guiando cada misión nueva.', '🏆 Archive complete! You recovered every story. These machines no longer move, but what they discovered still guides every new mission.')), 300);
  }
}
function quiz(it) {
  const Q = it.quiz;
  body.innerHTML = '<p class="rx-q"></p><div class="rx-opts" id="rx-opts"></div><p class="rx-fb" id="rx-fb" aria-live="polite"></p>';
  body.querySelector('.rx-q').textContent = Q.q;
  const box = $('#rx-opts'), fb = $('#rx-fb');
  Q.o.forEach((t, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'rx-opt'; b.textContent = t;
    b.onclick = () => {
      if (i === Q.a) { b.classList.add('right'); box.querySelectorAll('.rx-opt').forEach(x => x.disabled = true); fb.className = 'rx-fb ok'; fb.textContent = tx('¡Correcto! ', 'Correct! ') + Q.e;
        win(tx('La historia de ' + it.name + ' ya está a salvo.', 'The story of ' + it.name + ' is now safe.')); }
      else { b.classList.add('wrong'); b.disabled = true; fb.className = 'rx-fb no'; fb.textContent = tx('No es esa. Piensa en lo que contó ' + it.name + '.', 'Not that one. Think about what ' + it.name + ' told you.'); beep(180, .2); }
    };
    box.appendChild(b);
  });
  box.querySelector('.rx-opt').focus();
}


/* ---------- LÁSER (Apolo 15) ---------- */
function gameLaser() {
  const RT = 2.56; // segundos de ida y vuelta (promedio)
  body.innerHTML = '<p class="rx-hint"><strong>Tu turno:</strong> eres el observatorio. Dispara el láser hacia mis prismas y pulsa <em>Recibir</em> justo cuando creas que la luz regresa. La luz de vuelta es tan débil que no la verás: tarda lo mismo en volver que en ir.</p>' +
    '<canvas class="rx-game" id="l-c" width="720" height="260"></canvas><div class="rx-hud"><span>Tiempo <b id="l-t">0,00</b> s</span><span>Intentos <b id="l-n">0</b></span></div>' +
    '<div class="rx-actions"><button class="rx-btn" id="l-fire" type="button">Disparar láser</button><button class="rx-btn ghost" id="l-recv" type="button" disabled>Recibir</button></div><p class="rx-fb" id="rx-fb" aria-live="polite"></p>';
  const c = $('#l-c').getContext('2d'), fb = $('#rx-fb'); let t0 = null, tries = 0, state = 'idle', arrived = false; const ex = 70, mx = 650, cy = 130;
  const comma = n => n.toFixed(2).replace('.', ',');
  function draw(t) {
    c.fillStyle = '#04070d'; c.fillRect(0, 0, 720, 260);
    const rr = rng(4); for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(rr() * 720, rr() * 260, 1, 1); }
    c.fillStyle = '#3d6fd1'; c.beginPath(); c.arc(ex, cy, 44, 0, 7); c.fill(); c.fillStyle = '#4f9a6a'; c.beginPath(); c.ellipse(ex - 10, cy - 8, 18, 12, 0, 0, 7); c.fill();
    c.fillStyle = '#bdbab3'; c.beginPath(); c.arc(mx, cy, 24, 0, 7); c.fill();
    c.fillStyle = '#a3acce'; c.font = '12px "IBM Plex Mono", monospace'; c.textAlign = 'center';
    c.fillText('Tierra', ex, cy + 64); c.fillText('Luna', mx, cy + 44); c.fillText('≈ 384.400 km', 360, 240);
    if (t != null) {
      const half = RT / 2;
      if (t < half) { const x = ex + 44 + (mx - 24 - ex - 44) * (t / half); c.strokeStyle = 'rgba(255,90,90,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex + 44, cy); c.lineTo(x, cy); c.stroke(); c.fillStyle = '#ff6b6b'; c.beginPath(); c.arc(x, cy, 5, 0, 7); c.fill(); }
      else { c.strokeStyle = 'rgba(255,90,90,.12)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex + 44, cy); c.lineTo(mx - 24, cy); c.stroke();
        if (!arrived) { arrived = true; beep(1200, .08); }
        c.fillStyle = '#ffb84d'; c.beginPath(); c.arc(mx - 24, cy, 4 + 3 * Math.max(0, 1 - (t - half) * 3), 0, 7); c.fill();
        c.fillStyle = '#a3acce'; c.fillText('¿…y ahora de vuelta?', 360, cy - 24); }
    }
    c.textAlign = 'left';
  }
  draw(null);
  function step(now) {
    const t = (now - t0) / 1000; $('#l-t').textContent = comma(t); draw(t);
    if (t > RT * 2.2) { state = 'idle'; fb.className = 'rx-fb no'; fb.textContent = 'La luz ya llegó hace rato. Vuelve a intentarlo.'; $('#l-fire').disabled = false; $('#l-recv').disabled = true; $('#l-fire').focus(); return; }
    loop = requestAnimationFrame(step);
  }
  $('#l-fire').onclick = () => { if (state === 'fly') return; state = 'fly'; arrived = false; tries++; $('#l-n').textContent = tries; fb.textContent = ''; $('#l-fire').disabled = true; $('#l-recv').disabled = false; $('#l-recv').focus(); t0 = performance.now(); beep(1400, .06); loop = requestAnimationFrame(step); };
  $('#l-recv').onclick = () => {
    if (state !== 'fly') return; state = 'idle'; if (loop) cancelAnimationFrame(loop); loop = null;
    const t = (performance.now() - t0) / 1000, d = 299792 * t / 2, fmt = n => Math.round(n).toLocaleString('es-ES');
    $('#l-t').textContent = comma(t); $('#l-recv').disabled = true; $('#l-fire').disabled = false;
    if (Math.abs(t - RT) <= 0.2) { fb.className = 'rx-fb ok'; fb.textContent = 'Mediste ' + comma(t) + ' s. Distancia = velocidad de la luz × tiempo ÷ 2 = ' + fmt(d) + ' km. ¡Muy cerca de los 384.400 km reales!';
      win('Mediste la distancia a la Luna con la misma idea que usan hoy los observatorios con los retrorreflectores del Apolo.'); }
    else { fb.className = 'rx-fb no'; fb.textContent = 'Pulsaste a los ' + comma(t) + ' s, y eso daría ' + fmt(d) + ' km. La luz tarda unos ' + comma(RT) + ' s en ir y volver. ' + (t < RT ? 'Espera un poco más.' : 'Pulsa un poco antes.'); beep(180, .2); $('#l-fire').focus(); }
  };
  $('#l-fire').focus();
}

/* ---------- 6. CIELO LIMPIO ----------
   Oculta lo que distrae o no es real en nuestro sistema solar (agujeros negros,
   nebulosas pegadas, meteoritos flotando, estrellas fugaces, perrito, líneas de
   constelaciones). Se puede volver a activar desde el menú. */
let cieloLimpio = true;
try { cieloLimpio = localStorage.getItem('ecos3d-cielo') !== 'no'; } catch (e) {}
const cieloItem = document.createElement('div'); cieloItem.className = 'menu-item'; cieloItem.id = 'e-cielo-item';
cieloItem.setAttribute('role', 'button'); cieloItem.tabIndex = 0;
document.getElementById('menu-dropdown').insertBefore(cieloItem, document.getElementById('music-menu-item'));
function renderCieloItem() { cieloItem.textContent = cieloLimpio ? tx('✨ Mostrar decoraciones', '✨ Show decorations') : tx('✨ Cielo limpio (más ordenado)', '✨ Clean sky (tidier)'); }
function aplicarCielo() { if (window.__setCieloLimpio) window.__setCieloLimpio(cieloLimpio); renderCieloItem(); }
cieloItem.onclick = () => { cieloLimpio = !cieloLimpio; try { localStorage.setItem('ecos3d-cielo', cieloLimpio ? 'si' : 'no'); } catch (e) {} aplicarCielo(); document.getElementById('menu-dropdown').classList.remove('active'); };
cieloItem.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cieloItem.onclick(); } };

/* ---------- 7. ¿DÓNDE ESTÁ MI NAVE? ----------
   Mientras caminas: un rayo de luz sale de la nave, una flecha te dice hacia dónde
   está y a cuántos pasos, y un botón te devuelve a ella para despegar. */
const chip = document.createElement('div'); chip.id = 'e-ship'; chip.hidden = true;
chip.innerHTML = '<span class="arrow" aria-hidden="true">➤</span><span class="txt"></span><button type="button" class="go"></button>';
document.body.appendChild(chip);
const chipArrow = chip.querySelector('.arrow'), chipTxt = chip.querySelector('.txt'), chipGo = chip.querySelector('.go');
chipGo.onclick = () => { if (window.__juego) { window.__juego.takeOff(); triggerEveMessage(tx('🚀 ¡De vuelta en la nave! Seguimos volando.', '🚀 Back in the ship! Let\'s keep flying.')); } };
let beam = null, beamTop = null;
function crearFaro() {
  const J = window.__juego, mat = new THREE.MeshBasicMaterial({ color: 0xffb84d, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 90, 12, 1, true), mat); beam.position.y = 45; beam.visible = false; J.ship.add(beam);
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = 'rgba(13,19,38,.85)'; x.fillRect(0, 0, 256, 64); x.strokeStyle = '#ffb84d'; x.lineWidth = 4; x.strokeRect(2, 2, 252, 60);
  x.fillStyle = '#ffb84d'; x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(tx('TU NAVE', 'YOUR SHIP'), 128, 34);
  beamTop = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true, fog: false }));
  beamTop.scale.set(14, 3.5, 1); beamTop.position.y = 92; beamTop.visible = false; J.ship.add(beamTop);
}
const _s = new THREE.Vector3(), _a2 = new THREE.Vector3();
function vigilarNave() {
  const J = window.__juego;
  if (J && beam) {
    const caminando = !!J.walk.active;
    beam.visible = beamTop.visible = caminando;
    if (caminando !== !chip.hidden) chip.hidden = !caminando;
    if (caminando) {
      J.ship.getWorldPosition(_s); J.astro.getWorldPosition(_a2);
      const d = Math.round(_s.distanceTo(_a2));
      beam.material.opacity = 0.3 + 0.15 * Math.sin(performance.now() / 300);
      chipTxt.textContent = d < 12 ? tx('Estás junto a tu nave', 'You are next to your ship') : tx('Tu nave está a ' + d + ' pasos', 'Your ship is ' + d + ' steps away');
      chipGo.textContent = d < 12 ? tx('Despegar', 'Take off') : tx('Volver a la nave', 'Back to the ship');
      // flecha: hacia dónde queda la nave en la pantalla
      const p = _s.clone().project(J.camera); let dx = p.x, dy = p.y;
      if (p.z > 1) { dx = -dx; dy = -dy; }
      chipArrow.style.transform = 'rotate(' + (-Math.atan2(dy, dx)) + 'rad)';
    }
  }
  requestAnimationFrame(vigilarNave);
}
window.__alIniciar3D = function () { aplicarCielo(); crearFaro(); requestAnimationFrame(vigilarNave); };
if (window.__juego) window.__alIniciar3D();

/* ---------- INICIO ---------- */
renderMeter();
window.setLanguage(currentLang);
// Para probar desde la consola del navegador: Ecos.abrir('Spirit')
window.Ecos = { jugar: id => { const st = SITES.find(s => s.n === id); cur = st ? echoFromSite(st) : id === 'luna2' ? echoLuna2() : echoDeep(DEEP.find(d => d.id === id)); overlay.hidden = false; showChallenge(); }, abrir: n => { const st = SITES.find(s => s.n === n); if (st) openEcho(echoFromSite(st)); }, archivados: () => [...archived], total: TOTAL };
})();

const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://moybwkpzdbblgkhwxkwy.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1veWJ3a3B6ZGJibGdraHd4a3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg0OTcyNiwiZXhwIjoyMDc1NDI1NzI2fQ.hry3jCe3PiLSTF33garjoHfbei0_pFbxY_gwsA6WLiI";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente do Supabase não encontradas!");
  console.error(
    "Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY configuradas."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🌱 Iniciando seed do Supabase...");

  const author = {
    name: "Ana Beatriz",
    username: "anabeatriz_dev",
    avatar:
      "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/authors/anabeatriz_dev.png",
  };

  // Verificar se o autor já existe
  const { data: existingAuthor } = await supabase
    .from("User")
    .select("*")
    .eq("username", author.username)
    .single();

  let ana;
  if (existingAuthor) {
    console.log("✅ Autor já existe:", existingAuthor);
    ana = existingAuthor;
  } else {
    // Criar o autor
    const { data: newAuthor, error: authorError } = await supabase
      .from("User")
      .insert([author])
      .select()
      .single();

    if (authorError) {
      console.error("❌ Erro ao criar autor:", authorError);
      throw authorError;
    }

    console.log("✅ Autor criado:", newAuthor);
    ana = newAuthor;
  }

  const posts = [
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/introducao-ao-react.png",
      title: "Introdução ao React",
      slug: "introducao-ao-react",
      body: "Neste post, vamos explorar os conceitos básicos do React, uma biblioteca JavaScript para construir interfaces de usuário. Vamos cobrir componentes, JSX e estados.",
      markdown:
        "```javascript\nfunction HelloComponent() {\n  return <h1>Hello, world!</h1>;\n}\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/css-grid-na-pratica.png",
      title: "CSS Grid na Prática",
      slug: "css-grid-na-pratica",
      body: "Aprenda a criar layouts responsivos com CSS Grid. Este post aborda desde a definição de grid até a criação de layouts complexos de forma simples e eficaz.",
      markdown:
        "```css\n.grid-container {\n  display: grid;\n  grid-template-columns: auto auto auto;\n}\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/vuejs-para-iniciantes.png",
      title: "Vue.js para Iniciantes",
      slug: "vuejs-para-iniciantes",
      body: "Vue.js é um framework progressivo para a construção de interfaces de usuário. Este guia inicial cobre as funcionalidades essenciais do Vue.",
      markdown:
        "```javascript\nnew Vue({\n  el: '#app',\n  data: {\n    message: 'Olá Vue!'\n  }\n})\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/dicas-de-acessibilidade-web.png",
      title: "Dicas de Acessibilidade Web",
      slug: "dicas-de-acessibilidade-web",
      body: "Explorando a importância da acessibilidade na web, este post oferece dicas práticas para tornar seus sites mais acessíveis a todos os usuários.",
      markdown:
        '```html\n<a href="#" aria-label="Saiba mais sobre acessibilidade">Saiba mais</a>\n```',
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/introducao-ao-typescript.png",
      title: "Introdução ao TypeScript",
      slug: "introducao-ao-typescript",
      body: "Este post é um guia introdutório ao TypeScript, explicando como ele aumenta a produtividade e melhora a manutenção do código JavaScript.",
      markdown:
        "```typescript\nfunction greeter(person: string) {\n  return 'Hello, ' + person;\n}\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/otimizacao-de-performance-no-react.png",
      title: "Otimização de Performance no React",
      slug: "otimizacao-de-performance-no-react",
      body: "Discutindo técnicas avançadas para otimizar a performance de aplicações React, este post aborda conceitos como memoização e lazy loading.",
      markdown:
        "```javascript\nconst MemoizedComponent = React.memo(function MyComponent(props) {\n  /* render using props */\n});\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/explorando-flexbox-no-css.png",
      title: "Explorando Flexbox no CSS",
      slug: "explorando-flexbox-no-css",
      body: "Este post detalha o uso do Flexbox para criar layouts responsivos e flexíveis no CSS, com exemplos práticos para um entendimento fácil.",
      markdown:
        "```css\n.flex-container {\n  display: flex;\n  justify-content: space-around;\n}\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/angular-primeiros-passos.png",
      title: "Angular: Primeiros Passos",
      slug: "angular-primeiros-passos",
      body: "Ideal para iniciantes, este post introduz o Angular, um poderoso framework para desenvolvimento de aplicações web, com um exemplo básico.",
      markdown:
        "```typescript\n@Component({\n  selector: 'my-app',\n  template: '<h1>Olá Angular</h1>'\n})\nexport class AppComponent { }\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/gerenciamento-de-estado-com-redux.png",
      title: "Gerenciamento de Estado com Redux",
      slug: "gerenciamento-de-estado-com-redux",
      body: "Abordando um dos aspectos cruciais no desenvolvimento de aplicações React, este post ensina como gerenciar o estado de forma eficiente com Redux.",
      markdown:
        "```javascript\nconst reducer = (state = initialState, action) => {\n  switch (action.type) {\n    case 'ACTION_TYPE':\n      return { ...state, ...action.payload };\n    default:\n      return state;\n  }\n};\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/sass-simplificando-o-css.png",
      title: "Sass: Simplificando o CSS",
      slug: "sass-simplificando-o-css",
      body: "Este post explora como o pré-processador Sass pode simplificar e melhorar a escrita de CSS, através de variáveis, mixins e funções.",
      markdown:
        "```scss\n$primary-color: #333;\nbody {\n  color: $primary-color;\n}\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/webpack-um-guia-para-iniciantes.png",
      title: "Webpack: Um Guia para Iniciantes",
      slug: "webpack-um-guia-para-iniciantes",
      body: "Aprenda a configurar o Webpack, uma poderosa ferramenta de empacotamento de módulos, neste guia passo a passo para iniciantes.",
      markdown:
        "```javascript\nmodule.exports = {\n  entry: './path/to/my/entry/file.js'\n};\n```",
      authorId: ana.id,
    },
    {
      cover:
        "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/posts/construindo-spa-com-vuejs.png",
      title: "Construindo SPA com Vue.js",
      slug: "construindo-spa-com-vuejs",
      body: "Este post oferece um tutorial detalhado sobre como construir uma Single Page Application (SPA) eficiente e interativa usando o framework Vue.js.",
      markdown:
        "```javascript\nnew Vue({\n  el: '#app',\n  data: {\n    message: 'Bem-vindo à sua SPA Vue.js!'\n  }\n});\n```",
      authorId: ana.id,
    },
  ];

  // Inserir posts
  for (const post of posts) {
    // Verificar se o post já existe
    const { data: existingPost } = await supabase
      .from("Post")
      .select("*")
      .eq("slug", post.slug)
      .single();

    if (!existingPost) {
      const { data: newPost, error: postError } = await supabase
        .from("Post")
        .insert([post])
        .select()
        .single();

      if (postError) {
        console.error(`❌ Erro ao criar post "${post.title}":`, postError);
        throw postError;
      }

      console.log(`✅ Post criado: ${post.title}`);
    } else {
      console.log(`⏭️  Post já existe: ${post.title}`);
    }
  }

  console.log("🎉 Seed do Supabase concluído com sucesso!");
}

main().catch((e) => {
  console.error("❌ Erro durante o seed:", e);
  process.exit(1);
});

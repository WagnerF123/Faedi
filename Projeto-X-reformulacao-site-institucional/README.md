# Portal Institucional da Faculdade FAEDI

## Visão geral

Este repositório contém o portal institucional da Faculdade FAEDI. A versão atual está em desenvolvimento e homologação e ainda não deve ser tratada como uma publicação definitiva.

O projeto utiliza:

- HTML5 sem framework;
- CSS compartilhado e estilos específicos escopados por página;
- JavaScript puro no navegador;
- imagens PNG e JPEG com variantes WebP responsivas;
- arquivos PDF estáticos para Editais e Trabalhos de Conclusão de Curso (TCCs).

O projeto utiliza HTML, CSS e JavaScript, sem backend ou banco de dados. O painel de Editais armazena alterações no navegador do administrador.

Não há etapa de build, `package.json` ou dependências de execução para instalar. O portal é servido diretamente como conteúdo estático.

## Estrutura do projeto

### Páginas públicas

- `index.html`: página inicial, carrossel, apresentação institucional, cursos, notícias e processo seletivo;
- `cpa.html`: Comissão Própria de Avaliação e documentos da CPA;
- `editais.html`: consulta e filtros de editais;
- `admin-editais.html`: painel de publicação e manutenção de editais, restrito por sessão administrativa no servidor;
- `acesso-editais.html`: tela de acesso por senha ao painel de Editais;
- `tcc.html`: pesquisa e filtros de Trabalhos de Conclusão de Curso;
- `noticias.html`: listagem e filtros de notícias;
- `noticia.html`: matéria individual carregada pelo parâmetro `id`;
- `psicologia.html`, `pedagogia.html`, `enfermagem.html` e `educacao-fisica.html`: primeiro modelo de página de curso;
- `direito.html` e `odontologia.html`: segundo modelo de página de curso.

### Estilos

- `css/faedi.css`: estilos compartilhados, componentes institucionais e seções escopadas das páginas;
- `css/style.css` e `css/editais.css`: arquivos legados atualmente não referenciados pelas páginas. Não devem ser removidos sem nova auditoria.

### JavaScript

- `js/faedi-layout.js`: cabeçalho, navegação, busca, botão flutuante, rodapé e metadados de URLs compartilhados;
- `js/faedi.js`: menu, busca, carrossel da Home, abas dos cursos, foco e demais interações compartilhadas;
- `js/editais.js`: cadastro, filtros e renderização dos Editais;
- `js/admin-editais.js`: integração do painel de Editais com a API autenticada;
- `js/tcc.js`: cadastro, pesquisa, filtros e renderização dos TCCs;
- `js/script.js`: arquivo legado atualmente não carregado pelas páginas. Não remover sem auditoria.

### Imagens e documentos

- `images/`: logotipo e banners originais, que devem ser preservados;
- `images/optimized/`: variantes WebP responsivas e imagem social otimizada;
- `images/noticias/`: imagens disponíveis para notícias;
- `arquivos/editais/`: PDFs de editais e documentação interna de cadastro;
- `arquivos/tcc/`: PDFs de TCCs e documentação interna de cadastro.

## Como executar localmente

Não abra as páginas diretamente com `file://`. O layout, os caminhos relativos e os testes devem ser executados por um servidor HTTP local.

1. Abra um terminal na raiz do repositório.
2. Execute:

```bash
python -m http.server 8000
```

3. Acesse no navegador:

```text
http://localhost:8000
```

4. Para encerrar o servidor, volte ao terminal e pressione `Ctrl+C`.

O comando requer uma instalação funcional do Python disponível no `PATH`.

## Como atualizar Editais

### Painel administrativo

O painel está em `admin-editais.html` e o acesso é feito em `acesso-editais.html`. O painel salva os editais no armazenamento do navegador e eles ficam visíveis na página pública nesse mesmo navegador. Os PDFs devem ser publicados manualmente em `arquivos/editais/`; depois informe o link do arquivo no campo correspondente.

O cadastro centralizado está no array `editaisDocuments`, no início de `js/editais.js`.

Cada registro aceita:

- `id`: identificador único e estável;
- `title`: título do edital;
- `description`: descrição opcional;
- `category`: categoria opcional;
- `year`: ano;
- `publicationDate`: data de publicação opcional;
- `status`: `aberto`, `encerrado` ou `indisponivel`;
- `url`: caminho relativo ou URL segura do PDF.

Coloque os PDFs em `arquivos/editais/` e use um caminho relativo, por exemplo:

```js
url: "arquivos/editais/edital-01-2026-processo-seletivo.pdf"
```

Quando `url` estiver vazia, o portal mostra “Documento indisponível” sem gerar link navegável. Não use `#` como substituto de URL.

As instruções detalhadas, incluindo validações antes da publicação, estão em [arquivos/editais/README.txt](arquivos/editais/README.txt).

## Como atualizar TCCs

O cadastro centralizado está no array `tccDocuments`, em `js/tcc.js`. O array deve conter somente trabalhos reais e autorizados.

Cada registro aceita:

- `id`;
- `title`;
- `authors`;
- `advisor`;
- `coAdvisor`;
- `course`;
- `year`;
- `semester`;
- `keywords`;
- `abstract`;
- `publicationDate`;
- `pdfUrl`.

Coloque os PDFs em `arquivos/tcc/` e informe o caminho relativo em `pdfUrl`. Quando esse campo estiver vazio, o portal exibe “Documento indisponível” sem criar um link.

Nenhum TCC pode ser publicado sem autorização institucional, autorização aplicável dos autores e conferência de dados pessoais e direitos de publicação. Consulte o modelo comentado em `js/tcc.js` e as instruções completas em [arquivos/tcc/README.txt](arquivos/tcc/README.txt).

## Como atualizar Notícias

O fluxo atual não possui um arquivo de dados ou painel separado:

1. Abra `noticia.html` e localize `const noticias`.
2. Adicione um objeto ao array, preservando a ordem editorial desejada.
3. Use um `id` inteiro positivo, único e sem zeros ou caracteres adicionais.
4. Adicione ou atualize manualmente o card correspondente em `noticias.html`.
5. Se a notícia também aparecer na Home, atualize manualmente o respectivo card em `index.html`.
6. Teste `noticia.html?id=ID`, a listagem, os filtros e a navegação anterior/próxima.

O renderizador atual utiliza todos estes campos:

- `id`: identificador numérico único;
- `titulo`;
- `data`;
- `autor`;
- `categoria`;
- `imagem`: caminho local da imagem;
- `resumo`;
- `conteudo`: HTML controlado da matéria dentro de template literal.

Não há campos formalmente opcionais no objeto atual. Subseções internas do conteúdo, como listas e subtítulos, podem ser omitidas quando não fizerem parte da matéria aprovada.

Os links usam o formato `noticia.html?id=1`. A página rejeita IDs ausentes, inexistentes ou malformados. Ao adicionar uma categoria nova, também é necessário revisar os botões e a lógica de filtros da listagem; não crie categorias sem validação editorial.

Use imagens locais, com texto alternativo coerente com o contexto. Se uma nova imagem tiver grande dimensão ou aparecer como banner, gere variantes responsivas e atualize `picture`, `srcset` e `sizes` onde ela for usada.

## Como trocar banners

Os originais são:

- `images/BANNER PRINCIPAL.png`;
- `images/banner-secundario.png`.

Ao atualizar uma campanha:

1. preserve o arquivo original e mantenha uma cópia de segurança;
2. não recorte textos, marcas ou elementos da arte;
3. mantenha a proporção da peça;
4. gere variantes WebP adequadas para celular, tablet e desktop;
5. atualize os caminhos e descritores em `srcset` e confira `sizes`;
6. preserve um formato compatível como fallback do elemento `picture`;
7. atualize a imagem social otimizada quando a campanha institucional usada no compartilhamento mudar;
8. confira visualmente todas as resoluções antes de publicar.

As variantes atuais usam larguras de 768, 1280 e 1920 pixels. Evite servir os PNGs originais de mais de 20 MB como recurso principal ou como imagem de Open Graph.

## SEO técnico

As páginas possuem títulos, meta descriptions, Open Graph, Twitter Card e dados estruturados compatíveis com o conteúdo disponível. A notícia individual atualiza seus metadados e dados estruturados conforme o `id` válido.

Ainda não há domínio oficial confirmado. Por esse motivo:

- não existem URLs canônicas definitivas;
- `sitemap.xml` ainda não foi publicado;
- `robots.txt` não anuncia um sitemap;
- URLs relativas são convertidas em tempo de execução quando necessário.

Quando o domínio oficial for definido:

1. confirmar HTTPS e a versão preferencial do host;
2. adicionar uma canonical absoluta e única em cada página pública;
3. gerar `sitemap.xml` com URLs públicas absolutas;
4. adicionar a URL absoluta do sitemap ao `robots.txt`;
5. revisar as URLs de Open Graph, Twitter Card e JSON-LD;
6. validar o resultado em ferramentas de busca e compartilhamento;
7. providenciar e cadastrar o favicon institucional aprovado.

Não use domínio temporário ou fictício nos metadados definitivos.

## Hospedagem

O ambiente final de hospedagem ainda não foi confirmado. Este projeto não contém e não presume uma configuração específica da HostGator ou de outro provedor.

Antes da publicação, a infraestrutura deve confirmar:

- domínio e DNS;
- certificado HTTPS válido e redirecionamento para HTTPS;
- tipo MIME `image/webp` para os arquivos WebP;
- tipos MIME corretos para CSS, JavaScript, imagens e PDFs;
- compressão Brotli ou gzip para recursos de texto;
- política de cache e versionamento de arquivos estáticos;
- headers de segurança adequados ao ambiente;
- processo de backup dos arquivos e documentos;
- ambiente ou URL de homologação;
- procedimento documentado de publicação e plano de retorno.

Não publique os arquivos `README.txt` internos. Eles devem ser excluídos do pacote público ou bloqueados pelo servidor. Regras em `robots.txt` não substituem controle de acesso.

## Fluxo Git

Branch de desenvolvimento atual:

```text
reformulacao-site-institucional
```

Situação verificada em 31 de julho de 2026:

- a branch `reformulacao-site-institucional` rastreia `origin/reformulacao-site-institucional`;
- a `main` local rastreia `origin/main`;
- a branch de reformulação está 19 commits à frente da `main` local e não está divergente dela;
- nenhum merge na `main` está autorizado apenas por esta documentação.

Fluxo recomendado para uma alteração autorizada:

```bash
git status
git pull --ff-only
git add caminho/do/arquivo
git diff --cached
git commit -m "tipo: descrição objetiva"
git push
```

Regras operacionais:

- execute `git status` antes e depois de cada tarefa;
- não use `git add .` sem revisar o escopo;
- não misture conteúdo, design, documentação e correções não relacionadas no mesmo commit;
- revise `git diff` e `git diff --cached`;
- não faça merge na `main` sem revisão, homologação e autorização explícita;
- se houver alterações locais inesperadas, interrompa o fluxo e audite antes de atualizar ou restaurar arquivos.

## Checklist de homologação

- [ ] Textos institucionais revisados e aprovados.
- [ ] Nomes, datas, números e informações acadêmicas confirmados.
- [ ] Contatos, WhatsApp e redes sociais validados.
- [ ] PDFs de Editais corretos, legíveis e sem dados indevidos.
- [ ] TCCs reais cadastrados somente com autorização.
- [ ] Notícias, imagens, categorias e IDs revisados.
- [ ] Links internos e externos testados.
- [ ] Estados de documento indisponível testados.
- [ ] Página inicial e carrossel testados.
- [ ] Testes em desktop, tablet e celular concluídos.
- [ ] Navegação por teclado e foco revisados.
- [ ] Teste real com leitor de tela realizado.
- [ ] Contraste e textos alternativos validados.
- [ ] Imagens responsivas, WebP e fallbacks testados.
- [ ] Performance medida no ambiente de homologação.
- [ ] Domínio, DNS, HTTPS e metadados definitivos configurados.
- [ ] Favicon institucional aprovado e instalado.
- [ ] Sitemap e canonical configurados após definição do domínio.
- [ ] Backup anterior à publicação realizado.
- [ ] Plano de retorno testado e responsável pela publicação definido.

## Limitações atuais

- os editais são persistidos em arquivo JSON; não há banco de dados relacional;
- não existe painel administrativo;
- conteúdos dependem de edição manual dos arquivos;
- a Home, a listagem e a matéria individual de Notícias não compartilham uma única fonte de dados;
- o domínio oficial ainda não está definido;
- canonical e sitemap dependem do domínio definitivo;
- favicon institucional aprovado está pendente;
- validação visual real em todos os dispositivos ainda deve ser repetida na homologação;
- validação real com leitor de tela está pendente;
- publicação depende de acesso técnico e autorização institucional.

## Segurança e governança

- não publique dados pessoais, acadêmicos ou sensíveis sem base e autorização adequadas;
- não publique TCCs sem autorização institucional e dos titulares aplicáveis;
- valide a origem, integridade, acessibilidade e conteúdo de cada PDF;
- remova metadados indevidos dos documentos antes da publicação quando necessário;
- não armazene senhas, tokens, chaves ou credenciais no repositório;
- não exponha READMEs, instruções internas ou arquivos de manutenção no site público;
- mantenha backup recuperável antes de substituir documentos ou imagens;
- defina responsáveis institucionais por conteúdo, revisão jurídica, manutenção técnica, homologação e publicação;
- registre quem aprovou cada conteúdo sensível e quando ele foi publicado ou retirado.

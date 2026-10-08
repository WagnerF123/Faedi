Área interna de manutenção dos Trabalhos de Conclusão de Curso da FAEDI.

Este arquivo contém instruções técnicas e não deve ser publicado ou exposto no portal público.

COMO CADASTRAR UM TRABALHO

1. Confirme que o trabalho possui autorização institucional para publicação.
2. Coloque o PDF na pasta arquivos/tcc/.
3. Use um nome curto, descritivo, sem espaços e sem acentos.
4. Padrão recomendado: curso-ano-sobrenome-titulo-resumido.pdf
5. Abra js/tcc.js e localize o modelo completo dentro do comentário "MODELO TÉCNICO".
6. Copie somente o objeto entre { e } e cole-o dentro do array tccDocuments.
7. Substitua todos os textos marcadores pelos dados reais do trabalho.
8. Preencha pdfUrl com o caminho relativo correto, começando por arquivos/tcc/.
9. Ao cadastrar mais de um trabalho, separe os objetos com vírgula.
10. Não deixe textos marcadores no cadastro final.
11. Execute o portal por HTTP local e teste pesquisa, filtros, card e abertura do PDF.

CAMPOS DE tccDocuments

- id: identificador único, estável e sem espaços.
- title: título completo do trabalho.
- authors: lista de autores. Exemplo com dois marcadores: ["NOME COMPLETO DO PRIMEIRO AUTOR", "NOME COMPLETO DO SEGUNDO AUTOR"].
- advisor: nome completo do orientador.
- coAdvisor: nome completo do coorientador; use uma string vazia quando não houver.
- course: curso ao qual o trabalho pertence.
- year: ano do trabalho, preferencialmente como string com quatro dígitos.
- semester: semestre, conforme a informação institucional disponível.
- keywords: lista de palavras-chave. Exemplo com marcadores: ["PRIMEIRA PALAVRA-CHAVE REAL", "SEGUNDA PALAVRA-CHAVE REAL"].
- abstract: resumo integral autorizado para publicação.
- publicationDate: data de publicação conforme o padrão institucional adotado.
- pdfUrl: caminho do PDF a partir da raiz do site, por exemplo arquivos/tcc/nome-do-arquivo.pdf.

AUTORIZAÇÃO E DIREITOS DE PUBLICAÇÃO

Não publique sem autorização institucional. Antes de disponibilizar um PDF, confirme também a autorização dos respectivos autores, a titularidade do conteúdo, o tratamento adequado de dados pessoais e os direitos de publicação e reprodução.

VALIDAÇÃO ANTES DA PUBLICAÇÃO

- confirmar que o id é único e estável;
- substituir todos os marcadores do modelo pelos dados reais;
- confirmar título, autores, orientadores, curso, ano e demais metadados;
- verificar se autores e palavras-chave permanecem em listas válidas;
- abrir o PDF pelo card em uma nova aba;
- testar pesquisa por título, autor, orientador e palavra-chave;
- testar filtros de curso e ano;
- verificar legibilidade, tamanho do arquivo e acessibilidade do PDF;
- verificar se o PDF ou seus metadados contêm dados pessoais indevidos;
- manter uma cópia de segurança da versão substituída;
- registrar a autorização e o responsável institucional pela publicação.

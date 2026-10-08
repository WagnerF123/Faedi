Área interna de manutenção dos Editais da Faculdade FAEDI.

Este arquivo contém instruções técnicas e não deve ser publicado ou exposto no portal público.

COMO PUBLICAR UM EDITAL

1. Confirme que o documento é oficial e está autorizado para publicação.
2. Revise o PDF, inclusive dados pessoais, páginas, assinaturas, anexos e metadados.
3. Coloque o PDF nesta pasta: arquivos/editais/.
4. Use um nome descritivo, sem espaços e sem acentos.
5. Padrão recomendado: edital-NUMERO-ANO-assunto-resumido.pdf.
6. Abra js/editais.js e localize o array editaisDocuments.
7. Localize o registro existente ou adicione um registro autorizado.
8. Preencha url com o caminho relativo do PDF.
9. Revise o status e os campos opcionais disponíveis.
10. Execute o portal por HTTP local e teste o card, os filtros e a abertura do PDF.

EXEMPLO DE CAMINHO

url: "arquivos/editais/edital-01-2026-processo-seletivo.pdf"

CAMPOS DE editaisDocuments

- id: identificador único, estável e adequado para uso em atributos HTML.
- title: título oficial do edital.
- description: descrição opcional; use string vazia quando não houver texto aprovado.
- category: categoria opcional; use string vazia quando ela não estiver definida.
- year: ano do documento.
- publicationDate: data de publicação opcional.
- status: use somente aberto, encerrado ou indisponivel.
- url: caminho relativo ou URL segura do PDF; use string vazia enquanto o documento não estiver disponível.

DOCUMENTOS INDISPONÍVEIS

Quando url estiver vazia, o card permanece visível, mas a interface exibe “Documento indisponível” sem criar link navegável. Não use href="#", caminhos fictícios ou nomes de arquivos ainda inexistentes.

VALIDAÇÃO ANTES DA PUBLICAÇÃO

- confirmar que o id não está duplicado;
- confirmar título, ano, categoria, data e situação;
- abrir o PDF pelo card em uma nova aba;
- testar filtros de categoria, ano e situação;
- confirmar que o caminho diferencia maiúsculas e minúsculas corretamente;
- verificar legibilidade, tamanho do arquivo e acessibilidade do PDF;
- verificar se o PDF não contém dados pessoais ou metadados indevidos;
- manter uma cópia de segurança da versão substituída;
- registrar a aprovação e o responsável institucional pelo conteúdo.

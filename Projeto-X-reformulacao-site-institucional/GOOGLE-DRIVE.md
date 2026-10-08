# Editais compartilhados e envio de PDF pelo Apps Script

O painel envia PDFs para a pasta configurada no script e salva a lista de editais em um arquivo privado no Drive da conta que implantou o Apps Script. A página pública consulta essa lista, então todos os visitantes do site hospedado veem os mesmos editais. Não é necessário configurar o Google Cloud Console.

## Configurar ou atualizar o Apps Script

1. Entre na conta Google que tem permissão de editor na pasta e abra [script.google.com](https://script.google.com/).
2. Abra o projeto que gerou o URL configurado no site.
3. Em `Code.gs`, substitua o conteúdo pelo arquivo `google-apps-script/Code.gs` deste projeto.
4. Confira o `DRIVE_FOLDER_ID`. Defina `UPLOAD_KEY` como uma chave aleatória longa de pelo menos 32 caracteres. A chave não deve ser colocada em arquivos do site nem compartilhada.
5. Salve. No primeiro uso, execute uma função pelo editor e autorize o acesso ao Drive, se o Google solicitar.
6. Para uma implantação que já existe: **Implantar → Gerenciar implantações**, clique no lápis, escolha **Nova versão** e implante. Mantenha a implantação existente para conservar o URL `/exec` já configurado.

Na primeira publicação, o script cria no Meu Drive um arquivo privado `FAEDI_EDITAIS_DATABASE.json` com a lista compartilhada. Não apague esse arquivo se quiser manter os cadastros.

## Configurar o site

Em `js/google-drive-config.js`, `FAEDI_DRIVE_UPLOAD_URL` deve conter o URL implantado terminado em `/exec`. Esse arquivo é carregado pelo painel administrativo e pela página pública de editais. Publique no domínio oficial as versões atualizadas dos arquivos do site para ativar a integração.

## Publicar

No painel, preencha o edital, selecione o PDF e digite a chave `UPLOAD_KEY`. Ao publicar, o PDF é enviado para a pasta e compartilhado como **qualquer pessoa com o link — leitor**. O edital é salvo no arquivo compartilhado e aparece na página pública para todos. A chave fica lembrada apenas na sessão atual do navegador após uma operação bem-sucedida.

Se o documento já estiver no Drive, deixe o campo de arquivo vazio e informe seu link. Editar e remover editais também atualiza a lista compartilhada; essas operações pedem a chave de envio.

**Atenção:** a implantação do Apps Script grava os PDFs na conta de quem a publicou. Proteja a chave e não compartilhe o projeto do Apps Script com pessoas não autorizadas. O Google ou uma política da organização pode impedir o compartilhamento público dos PDFs.

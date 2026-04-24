# NPC Tags

Módulo para Foundry VTT v13+ que permite adicionar palavras-chave (tags) aos actors para facilitar pesquisa e filtragem.

## Funcionalidades

- **Adicionar tags** aos actors usando palavras-chave livres
- **Normalização automática**: minúsculas, remoção de acentos (ç→c, ã→a, etc.)
- **Múltiplas tags**: cada palavra separadas por espaço é uma nova tag
- **Interface intuitiva** para adicionar/remover tags

## Interfaces

### 1. Macro (Recomendado)

Crie uma macro com o seguinte código:
```javascript
await game.npcTags.openTagEditorAPI();
```

Coloque a macro na barra de macros. Ao executar, selecione tokens na scene primeiro - o sistema detectará os actors vinculados.

### 2. Menu de Contexto

Clique com botão direito em um actor na lista do sidebar (aba Actors) e selecione "Editar Tags...".

### 3. Botão na Sheet

Abra a sheet de um actor e clique no ícone de tag no canto superior direito.

## Como Usar

###Adicionar Tags

1. Selecione tokens na scene (ou use menu contexto/sheet)
2. Execute a macro ou clique na opção desejada
3. Digite as tags no campo de texto (separadas por espaço)
4. Clique em Salvar

**Exemplo**: `carecaanao magico`
Resulta em: `careca`, `anao`, `magico`

###Normalização

O sistema converte automaticamente:
- Minúsculas: `MAO` → `mao`
- Acentos: `ação` → `acao`, `marçal` → `marcal`
- Caracteres especiais removidos: `dr.#1` → `dr1`

## Instalação

1. Baixe o módulo
2. Cole na pasta `modules/npcTags`
3. Ative o módulo no gerenciamento de módulos do Foundry

## Busca por Tags (Em Desenvolvimento)

Futimamente será possível filtrar actors por tags na lista do sidebar.

## Requisitos

- Foundry VTT versão 13+

## Licença

MIT
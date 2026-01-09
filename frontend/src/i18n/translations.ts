export const translations = {
  en: {
    // Header
    appTitle: '🐔 POUL LE FUN 🐔',
    nav: {
      home: '🏠 Home',
      coops: '🐓 Coops',
      games: '🎮 Games',
      rankings: '🏆 Rankings',
      matrix: '📊 Matrix',
    },

    // Footer
    footer: {
      tagline: '🐤 Where Champions Are Hatched! 🐤',
      copyright: 'Poul Le Fun © 2026',
    },

    // Home Page
    home: {
      title: '🐔 POUL LE FUN 🐔',
      subtitle: '🎮 The Cluckiest Card Tournament! 🎮',
      tagline: 'Where Champions Are Hatched!',
      howToPlay: '🎮 How to Play',
      welcome: 'Welcome to the chickeniest tournament app! Here\'s how to run your tournament:',
      step1: {
        title: '🐣 1. Build Your Coops',
        description: 'Add chicks and hatch random team pairings. Create your perfect coops!',
        button: '🐓 Go to Coops',
      },
      step2: {
        title: '🎮 2. Start the Pecking Order',
        description: 'Generate fair matchups ensuring all coops play equally. Let the games begin!',
        button: '🎮 Go to Games',
      },
      step3: {
        title: '🏆 3. View High Scores',
        description: 'Track who\'s laying the golden eggs! See wins, losses, and overall standings.',
        button: '🏆 Go to Rankings',
      },
      step4: {
        title: '📊 4. Match Matrix',
        description: 'Visual overview of all battles in the barnyard - played and remaining.',
        button: '📊 Go to Matrix',
      },
      admin: {
        title: '🍗 Administration',
        warning: '⚠️ Danger zone: Use these options with caution!',
        clearButton: '🧹 Reset the Farm',
        dialogTitle: 'Clear All Data?',
        dialogContent: 'Are you sure you want to clear the entire database?',
        dialogWarning: 'This will permanently delete:',
        deleteTeams: 'All teams',
        deleteGames: 'All games',
        deleteResults: 'All results',
        cannotUndo: 'This action cannot be undone!',
        cancel: 'Cancel',
        confirm: 'Yes, Clear Everything',
        clearing: 'Clearing...',
        successMessage: 'Database cleared! Deleted {{teams}} teams, {{games}} games, and {{results}} results.',
      },
    },

    // Name Bank Creation
    nameBank: {
      title: '🐔 Build Your Coop 🐔',
      subtitle: 'Add chicks to your coop one at a time. Press Enter or click Add.',
      chickNameLabel: '🐣 Chick Name',
      placeholder: 'Enter chick name...',
      addButton: '🐣 Add',
      chicksReady: '🐥 Chicks ready: {{count}}',
      evenNumber: ' ✓ (even number)',
      oddNumber: ' ⚠ (need even number)',
      emptyState: '🐣 Start by adding chicks to build your coops',
      clearButton: '🧹 Clear Coop',
      hatchButton: '🥚 Hatch Teams!',
      hatching: '🥚 Hatching...',
      errors: {
        enterName: 'Please enter a name',
        duplicate: 'This name has already been added',
        minPlayers: 'At least 2 players required',
        evenPlayers: 'Number of players must be even',
      },
    },

    // Manual Team Creation
    manualTeam: {
      title: '🐓 Pair Chicks Manually 🐓',
      subtitle: 'Enter two chick names to create a specific coop pairing.',
      chick1Label: '🐣 Chick 1',
      chick2Label: '🐣 Chick 2',
      placeholder1: 'Enter first chick name',
      placeholder2: 'Enter second chick name',
      createButton: '🥚 Create Coop',
      creating: '🥚 Creating...',
    },

    // Team List
    teamList: {
      title: '🐓 Your Coops ({{count}})',
      emptyTitle: '🐣',
      emptyMessage: 'No coops yet! Add some chicks above to get started!',
      deleteDialog: {
        title: '🪶 Fly the Coop?',
        message: 'Are you sure you want to delete {{teamName}}?',
        warning: 'This action cannot be undone. Coops that have played games cannot be deleted.',
        cancel: 'Cancel',
        confirm: '🪶 Fly Away',
        deleting: '🪶 Flying...',
      },
    },

    // Team Generation Animation
    animation: {
      scrambling: '🐔 Scrambling the Chicks...',
      hatching: '🥚 Hatching Perfect Coops...',
      ready: '🐓 Coops Ready!',
      created: '🐔 Coops Created! 🐔',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      save: 'Save',
    },
  },

  fr: {
    // Header
    appTitle: '🐔 POUL LE FUN 🐔',
    nav: {
      home: '🏠 Accueil',
      coops: '🐓 Poulaillers',
      games: '🎮 Parties',
      rankings: '🏆 Classement',
      matrix: '📊 Matrice',
    },

    // Footer
    footer: {
      tagline: '🐤 Où les Champions Éclosent! 🐤',
      copyright: 'Poul Le Fun © 2026',
    },

    // Home Page
    home: {
      title: '🐔 POUL LE FUN 🐔',
      subtitle: '🎮 Le Plus Fou des Tournois de Cartes! 🎮',
      tagline: 'Où les Champions Éclosent!',
      howToPlay: '🎮 Comment Jouer',
      welcome: 'Bienvenue dans l\'app de tournoi la plus poulette! Voici comment organiser votre tournoi:',
      step1: {
        title: '🐣 1. Construisez vos Poulaillers',
        description: 'Ajoutez des poussins et faites éclore des paires aléatoires. Créez vos poulaillers parfaits!',
        button: '🐓 Aller aux Poulaillers',
      },
      step2: {
        title: '🎮 2. Lancez l\'Ordre du Becquet',
        description: 'Générez des matchs équitables pour que tous les poulaillers jouent également. Que les jeux commencent!',
        button: '🎮 Aller aux Parties',
      },
      step3: {
        title: '🏆 3. Voir les Meilleurs Scores',
        description: 'Suivez qui pond les œufs d\'or! Voyez les victoires, défaites et classement général.',
        button: '🏆 Aller au Classement',
      },
      step4: {
        title: '📊 4. Matrice des Matchs',
        description: 'Vue d\'ensemble des batailles dans la basse-cour - jouées et à venir.',
        button: '📊 Aller à la Matrice',
      },
      admin: {
        title: '🍗 Administration',
        warning: '⚠️ Zone dangereuse: Utilisez ces options avec précaution!',
        clearButton: '🧹 Réinitialiser la Ferme',
        dialogTitle: 'Effacer Toutes les Données?',
        dialogContent: 'Êtes-vous sûr de vouloir effacer toute la base de données?',
        dialogWarning: 'Ceci supprimera définitivement:',
        deleteTeams: 'Toutes les équipes',
        deleteGames: 'Toutes les parties',
        deleteResults: 'Tous les résultats',
        cannotUndo: 'Cette action est irréversible!',
        cancel: 'Annuler',
        confirm: 'Oui, Tout Effacer',
        clearing: 'Effacement...',
        successMessage: 'Base de données effacée! Supprimé {{teams}} équipes, {{games}} parties, et {{results}} résultats.',
      },
    },

    // Name Bank Creation
    nameBank: {
      title: '🐔 Construisez Votre Poulailler 🐔',
      subtitle: 'Ajoutez des poussins un à la fois. Appuyez sur Entrée ou cliquez sur Ajouter.',
      chickNameLabel: '🐣 Nom du Poussin',
      placeholder: 'Entrez le nom du poussin...',
      addButton: '🐣 Ajouter',
      chicksReady: '🐥 Poussins prêts: {{count}}',
      evenNumber: ' ✓ (nombre pair)',
      oddNumber: ' ⚠ (besoin d\'un nombre pair)',
      emptyState: '🐣 Commencez par ajouter des poussins pour construire vos poulaillers',
      clearButton: '🧹 Vider le Poulailler',
      hatchButton: '🥚 Faire Éclore les Équipes!',
      hatching: '🥚 Éclosion...',
      errors: {
        enterName: 'Veuillez entrer un nom',
        duplicate: 'Ce nom a déjà été ajouté',
        minPlayers: 'Au moins 2 joueurs requis',
        evenPlayers: 'Le nombre de joueurs doit être pair',
      },
    },

    // Manual Team Creation
    manualTeam: {
      title: '🐓 Apparier des Poussins Manuellement 🐓',
      subtitle: 'Entrez deux noms de poussins pour créer un appariement de poulailler spécifique.',
      chick1Label: '🐣 Poussin 1',
      chick2Label: '🐣 Poussin 2',
      placeholder1: 'Entrez le nom du premier poussin',
      placeholder2: 'Entrez le nom du deuxième poussin',
      createButton: '🥚 Créer le Poulailler',
      creating: '🥚 Création...',
    },

    // Team List
    teamList: {
      title: '🐓 Vos Poulaillers ({{count}})',
      emptyTitle: '🐣',
      emptyMessage: 'Aucun poulailler encore! Ajoutez des poussins ci-dessus pour commencer!',
      deleteDialog: {
        title: '🪶 Faire Voler le Poulailler?',
        message: 'Êtes-vous sûr de vouloir supprimer {{teamName}}?',
        warning: 'Cette action est irréversible. Les poulaillers qui ont joué ne peuvent pas être supprimés.',
        cancel: 'Annuler',
        confirm: '🪶 Faire Voler',
        deleting: '🪶 Envol...',
      },
    },

    // Team Generation Animation
    animation: {
      scrambling: '🐔 Mélange des Poussins...',
      hatching: '🥚 Éclosion des Poulaillers Parfaits...',
      ready: '🐓 Poulaillers Prêts!',
      created: '🐔 Poulaillers Créés! 🐔',
    },

    // Common
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      delete: 'Supprimer',
      save: 'Enregistrer',
    },
  },
};

export type Language = 'en' | 'fr';
export type TranslationKeys = typeof translations.en;

# HORSES - Dominion-Inspired Deck Builder

A single-player deck-building game inspired by Dominion, built with vanilla JavaScript and modern web technologies.

## 🎮 Game Overview

HORSES is a strategic deck-building game where you start with a basic deck of 10 cards (7 Coppers + 3 Estates) and build your collection through strategic purchases and clever card play. The goal is to accumulate victory points by buying powerful cards and creating synergistic combinations.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   python3 -m http.server 3000
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

3. **Play the game:**
   - Click "Start New Game" on the landing page
   - Configure your game settings (optional)
   - Begin building your deck!

## 📁 Project Structure

### Core JavaScript Files

#### `src/main.js` - Main Application Controller
The central orchestrator that manages the entire application flow.
- **ScreenManager**: Handles navigation between landing page, setup, and game screens
- **GameController**: Coordinates game logic and UI updates
- **GameUI**: Manages all user interface rendering and interactions
- **Event Handling**: Processes user clicks, card plays, and game actions
- **Error Management**: Provides user-friendly error messages and validation

#### `src/game.js` - Game State & Logic Engine
The heart of the game mechanics and state management.
- **GameState**: Main game controller with turn management and phase progression
- **Player**: Player state management (deck, hand, discard, play area, resources)
- **SupplyPile**: Supply management with card counts and availability
- **GameFactory**: Creates new games with proper initialization
- **Game Phases**: SETUP → DEALING → ACTION → BUY → CLEANUP → GAME_OVER
- **Effect System**: Executes card effects (draw, actions, buys, money)
- **Game End Conditions**: Checks for victory conditions and determines winners

#### `src/cards.js` - Card Definitions & Registry
Comprehensive card system with definitions, effects, and management.
- **Card Definitions**: Complete card library with properties, costs, and effects
- **CardType System**: TREASURE, VICTORY, ACTION, ACTION_TREASURE, ACTION_VICTORY, CURSE
- **Effect System**: String-based effects (e.g., "draw:3", "actions:2", "money:1")
- **CardRegistry**: Centralized card lookup and filtering system
- **Supply Management**: Default supply setups and card availability
- **Complex Cards**: Support for cards requiring targeting or special handling

### Supporting Files

#### `index.html` - Multi-Screen Interface
Single-page application with three main screens:
- **Landing Page**: Welcome screen with game introduction and start options
- **Setup Screen**: Game configuration and card selection interface
- **Game Screen**: Full gameplay interface with all game elements

#### `styles.css` - Comprehensive Styling
Modern, responsive design system:
- **Screen Management**: CSS-based screen switching and transitions
- **Card Styling**: Visual design for different card types and states
- **Responsive Layout**: Mobile-friendly grid and flexbox layouts
- **Interactive Elements**: Hover effects, animations, and visual feedback
- **Typography**: Outfit font integration with proper hierarchy

## 🎯 Game Mechanics

### Core Loop
1. **Draw Phase**: Draw 5 cards from your deck
2. **Action Phase**: Play action cards (if you have actions remaining)
3. **Buy Phase**: Use treasure to buy new cards from the supply
4. **Cleanup**: Discard played cards and cards in hand, draw new hand

### Card Types
- **Treasure Cards**: Provide money for buying (Copper, Silver, Gold)
- **Victory Cards**: Worth points at game end (Estate, Duchy, Province)
- **Action Cards**: Provide various effects (draw cards, gain actions, etc.)
- **Action-Treasure/Victory**: Hybrid cards that serve multiple purposes

### Victory Conditions
- **Primary**: Accumulate the most victory points
- **Alternative**: Game ends when 3+ supply piles are empty
- **Province Rule**: Game ends immediately if Province pile is empty

## 🃏 Available Cards

### Base Cards
- **Copper** (0 cost) - Worth 1 money
- **Silver** (3 cost) - Worth 2 money  
- **Gold** (6 cost) - Worth 3 money
- **Estate** (2 cost) - Worth 1 VP
- **Duchy** (5 cost) - Worth 3 VP
- **Province** (8 cost) - Worth 6 VP

### Action Cards
- **Smithy** (4 cost) - Draw 3 cards
- **Village** (3 cost) - Draw 1 card, +2 Actions
- **Market** (5 cost) - Draw 1 card, +1 Action, +1 Buy, +1 Gold
- **Festival** (5 cost) - +2 Actions, +1 Buy, +2 Gold
- **Laboratory** (5 cost) - +2 Cards, +1 Action
- **Workshop** (3 cost) - Gain a card costing up to 4
- **Woodcutter** (3 cost) - +1 Buy, +2 Gold
- **Council Room** (5 cost) - +4 Cards, +1 Buy
- **And many more...**

## 🔧 Development

### Architecture Highlights
- **Single-Page Application**: Smooth navigation without page reloads
- **Modular Design**: Clean separation of concerns between files
- **Event-Driven**: Responsive UI with proper event handling
- **State Management**: Centralized game state with clear data flow
- **Extensible**: Easy to add new cards, effects, and game modes

### Key Features
- **Real-time Updates**: UI automatically reflects game state changes
- **Error Handling**: User-friendly error messages and validation
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Debug Support**: Global access to controllers for development

## 🐛 Known Issues

- End game win conditions need refinement
- Some complex card interactions require additional UI implementation
- Deck inventory display needs optimization

## 📋 To-Do List

- [ ] Implement save/load game functionality
- [ ] Add card selection UI for complex cards (Chapel, Throne Room, etc.)
- [ ] Create card animations and visual effects
- [ ] Add sound effects and music
- [ ] Implement statistics tracking
- [ ] Add tutorial mode for new players
- [ ] Create additional card sets and expansions
- [ ] Add AI opponent for multiplayer simulation

## 🎨 Design Notes

The game uses the **Outfit** font family from Google Fonts for a modern, clean appearance. The color scheme emphasizes readability and accessibility while maintaining visual appeal. The interface is designed to be intuitive for both new and experienced deck-building game players.

---

*Built with vanilla JavaScript, HTML5, and CSS3. No frameworks required!*
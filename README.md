# Hardcore Parkour

Playable vertical-slice prototype built from the project game plan.

## Run
Because this is a browser game using modules, serve the folder with a local web server:

```bash
cd /Users/Joseph/Code/Games/Hardcore\ Parkour
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Prototype features
- Auto-runner physics loop
- 0.2 second landing shout window (`Enter`) for HARDCORE boost
- Character differences for Michael, Dwight, and Andy
- Style multiplier + score + injury system
- Five themed world phases during a run
- End-of-level "Performance Review" with stars and currency rewards

## Next implementation targets
- Conference Room level select scene
- Break Room shop + Pam quest lock/unlock flow
- Annex outfit system + Dundies unlock tracking
- Real level data files, cutscenes, and boss encounters

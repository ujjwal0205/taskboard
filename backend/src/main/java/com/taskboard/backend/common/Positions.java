package com.taskboard.backend.common;

import java.util.List;

public final class Positions {
    
    public static final double GAP = 1024;
    public static final double MIN_GAP = 1e-9;

    private Positions(){

    }

    public static double place(List<? extends Positioned> siblings, int index) {
        
        if(siblings.isEmpty()){
            return GAP;
        }

        int slot = Math.max(0, Math.min(index, siblings.size()));
        if(slot == 0){
            return siblings.get(0).getPosition() - GAP;
        }

        if(slot == siblings.size()){
            return siblings.get(siblings.size()-1).getPosition() + GAP;
        }

        double before = siblings.get(slot - 1).getPosition();
        double after = siblings.get(slot).getPosition();

        if(after - before < MIN_GAP){
            for( int i =0; i < siblings.size(); i++){
                siblings.get(i).setPosition((i + 1) * GAP);
            }
            before = siblings.get(slot -1 ).getPosition();
            after = siblings.get(slot).getPosition();
        }
        return ( before + after) / 2;
    }
}



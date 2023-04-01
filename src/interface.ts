
export interface I_TreeView{

    nodes: I_Node[]
}

export interface I_Node {
    name: string;
    state: {checked: boolean, selected: boolean, expanded: boolean}

    nodes: I_Node[];
}
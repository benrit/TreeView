import {useEffect, useRef, useState, MouseEvent} from "react";
import styles from "./ContextMenu.module.css";

interface ContextMenu_i {
    name: String;
    fn: Function;
}

export default function useContextMenu(data: ContextMenu_i[]) {
    const contextRef = useRef<any>();
    const [show, setShow] = useState<boolean>(false);
    const [pos, setPos] = useState({x: 0, y: 0});
    const [currentElement, setCurrentElement] = useState();

    useEffect(()=>{
        if (contextRef && show)
        {
            contextRef.current.focus();
        }
    }, [show])

    return {
        showContext: (event: MouseEvent<HTMLDivElement>, element: any)=>{
            setCurrentElement(element);
            setPos({x: event.clientX, y: event.clientY});
            setShow(true);
        },
        contextMenu :  ( show ?
            <div
                className={styles.ContextMenu}
                style={{left: pos.x, top: pos.y}}
                tabIndex={0}
                ref={contextRef}
                onBlur={()=>{
                    setShow(false);
                }}
            >
                <ol>
                {data.map((item, index)=>{
                    return <li key={index} onClick={()=>{
                        item.fn(currentElement);
                        setShow(false);

                    }}>{item.name}</li>
                })}
                </ol>
            </div> : undefined
        )
    }
}
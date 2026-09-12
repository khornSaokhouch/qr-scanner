"use client";


import {
    useEffect,
    useRef
} from "react";


import {
    Html5Qrcode
} from "html5-qrcode";


interface Props {

    onScan: (value: string) => void;

}


export default function Scanner({
    onScan

}: Props) {


    const scannerRef =
        useRef<Html5Qrcode | null>(null);



    useEffect(() => {


        const scanner =
            new Html5Qrcode(
                "smartscan-reader"
            );


        scannerRef.current = scanner;



        scanner.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                }

            },


            (decodedText) => {


                onScan(decodedText);


                scanner.stop();


            },


            (error) => {

            }


        );



        return () => {

            scanner.stop()
                .catch(() => { });


        };


    }, []);



    return (

        <div>


            <div
                id="smartscan-reader"
            />


        </div>

    );


}
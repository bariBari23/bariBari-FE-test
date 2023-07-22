import { useEffect, useState, useRef } from 'react';
import { createUserLocation } from '../../apis/api/location';
import { getUserInfo } from '../../apis/api/user';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { storeAddressState } from '../../utils/atom';

declare global {
    interface Window {
        kakao: any;
    }
    const kakao: any;
}

export default function MapContainer(props: {
    size: [number, number];
    userAddress: string;
    isSearched: boolean;
    userPosition: {
        latitude: number;
        longitude: number;
    };
}): JSX.Element {
    const { size, userAddress, isSearched, userPosition } = props;
    const [kakaoMap, setKakaoMap] = useState<any>(null);
    const [marker, setMarkers] = useState<any>(null);
    const [storeMarkers, setStoreMarkers] = useState<any[]>([]);
    const storeAddress = useRecoilValue(storeAddressState);
    // 도로명 주소 저장해주는 userStringAddress
    const [userStringAddress, setUserStringAddress] = useState<string>('');

    // 유저의 위치 정보를 createUserLocation api 활용해 보냄
    const callCreateUserLocation = async () => {
        if (marker) {
            try {
                const userInfo = await getUserInfo();
                const email = userInfo.data.email;
                const latitude = marker.n.La;
                const longitude = marker.n.Ma;
                try {
                    const result = await createUserLocation(latitude, longitude, email);
                    console.log('API 호출 결과:', result);
                } catch (error) {
                    console.log('API 호출 중 에러 발생:', error);
                }
            } catch (error) {
                console.log('Error fetching user info:', error);
            }
        }
    };
    // 마커 이미지 커스텀
    const createCustomMarkerImage = () => {
        if (kakaoMap) {
            const imageUrl = 'https://i.ibb.co/7vrcJBH/marker-Home.png';
            const imageUrlTwo = 'https://i.ibb.co/8KFW6rw/marker-Store.png';
            // 커스텀 마커 이미지 생성
            const icon = new kakao.maps.MarkerImage(imageUrl, new kakao.maps.Size(31, 35), {
                offset: new kakao.maps.Point(16, 34),
                alt: '내 위치 마커 이미지 예제',
                shape: 'poly',
                coords: '1,20,1,9,5,2,10,0,21,0,27,3,30,9,30,20,17,33,14,33',
            });
            const iconTwo = new kakao.maps.MarkerImage(imageUrlTwo, new kakao.maps.Size(31, 35), {
                offset: new kakao.maps.Point(16, 34),
                alt: '상점 마커 이미지 예제',
                shape: 'poly',
                coords: '1,20,1,9,5,2,10,0,21,0,27,3,30,9,30,20,17,33,14,33',
            });

            return { icon, iconTwo };
        }
        return null;
    };
    useEffect(() => {
        const container = document.getElementById('container');
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
        document.head.appendChild(script);

        script.onload = () => {
            kakao.maps.load(() => {
                const center = new kakao.maps.LatLng(37.56137355770315, 126.94500188216101);
                const options = {
                    center,
                    level: 5,
                };

                const map = new kakao.maps.Map(container, options);
                setKakaoMap(map); // map 인스턴스 생성 후 state에 저장
            });
        };
    }, []);

    //테스트
    // useEffect(() => {
    //     if (!kakaoMap || !userAddress) {
    //         return;
    //     }
    //     // 전의 마커 지우기
    //     if (userAddress.length === 0) {
    //         marker.setMap(null);
    //         setMarkers(null);
    //     }
    //     // 전의 마커 지우기
    //     if (marker) {
    //         marker.setMap(null);
    //         setMarkers(null);
    //     }
    //     // 상점 주소가 표시가 될까낭
    //     // 각 상점의 주소로 마커 표시
    //     const geocoderTest = new kakao.maps.services.Geocoder();
    //     storeLocation.forEach((address: any) => {
    //         geocoderTest.addressSearch(address, (result: any, status: any) => {
    //             if (status === kakao.maps.services.Status.OK) {
    //                 const latitude = result[0].y;
    //                 const longitude = result[0].x;
    //                 // 새로운 마커 이미지 생성
    //                 const customMarkerImage = createCustomMarkerImage();
    //                 // 새로운 위도, 경도로 마커 생성
    //                 const newMarker = new kakao.maps.Marker({
    //                     map: kakaoMap,
    //                     position: new kakao.maps.LatLng(latitude, longitude),
    //                     image: customMarkerImage,
    //                 });
    //                 setStoreMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    //             }
    //         });
    //     });

    //     // Use the geocoder to get the location data based on the userAddress
    //     const geocoder = new kakao.maps.services.Geocoder();
    //     const callback = function (result: any, status: any) {
    //         if (status === kakao.maps.services.Status.OK) {
    //             // result로 받은 주소가 많을 경우 result[0]에 있는 위도, 경도 사용
    //             console.log('4');

    //             const latitude = result[0].y;
    //             const longitude = result[0].x;
    //             //새로운 마커 이미지 생성
    //             const customMarkerImage = createCustomMarkerImage();
    //             // 새로운 위도, 경도로 마커 생성
    //             const newMarker = new kakao.maps.Marker({
    //                 map: kakaoMap,
    //                 position: new kakao.maps.LatLng(latitude, longitude),
    //                 image: customMarkerImage,
    //             });
    //             setMarkers(newMarker);
    //             console.log(result);
    //         } else {
    //             // 주소가 아예 존재하지 않을 때
    //             setMarkers(null);
    //         }
    //     };
    //     geocoder.addressSearch(userAddress, callback);
    // }, [kakaoMap, isSearched]);

    // useEffect(() => {
    //     if (!kakaoMap || !userAddress) {
    //         return;
    //     }

    //     // 이전에 있던 상점 마커들 삭제
    //     if (storeMarkers.length > 0) {
    //         storeMarkers.forEach((marker) => marker.setMap(null));
    //     }
    //     console.log('bari2');

    //     // 각 상점의 주소로 마커 표시
    //     const geocoder = new kakao.maps.services.Geocoder();
    //     console.log('bari2');

    //     storeAddress.forEach((address) => {
    //         geocoder.addressSearch(address, (result: any, status: any) => {
    //             console.log('bari');
    //             if (status === kakao.maps.services.Status.OK) {
    //                 const latitude = result[0].y;
    //                 const longitude = result[0].x;
    //                 // 새로운 마커 이미지 생성 (유저 위치에는 icon, 상점 위치에는 iconTwo를 사용)
    //                 const customMarkerImage = createCustomMarkerImage();
    //                 console.log('customMarkerImage', customMarkerImage);

    //                 // 새로운 위도, 경도로 마커 생성
    //                 const newMarker = new kakao.maps.Marker({
    //                     map: kakaoMap,
    //                     position: new kakao.maps.LatLng(latitude, longitude),
    //                     image: customMarkerImage?.iconTwo, // iconTwo를 사용하여 상점 위치에 대한 마커 생성
    //                 });
    //                 setStoreMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    //             }
    //         });
    //     });
    // }, [kakaoMap]);

    useEffect(() => {
        if (!kakaoMap) {
            return;
        }

        if (userAddress && isSearched) {
            // 전의 마커 지우기
            if (userAddress.length === 0) {
                setMarkers(null);
            }
            // 전의 마커 지우기
            if (marker) {
                marker.setMap(null);
                setMarkers(null);
            }

            // 사용자 주소에 따라 마커 띄우기 at SignUp3
            const geocoderTest = new kakao.maps.services.Geocoder();
            const callback = function (result: any, status: any) {
                if (status === kakao.maps.services.Status.OK) {
                    // result로 받은 주소가 많을 경우 result[0]에 있는 위도, 경도 사용
                    const latitude = result[0].y;
                    const longitude = result[0].x;
                    //새로운 마커 이미지 생성
                    const customMarkerImage = createCustomMarkerImage();
                    // 새로운 위도, 경도로 마커 생성
                    const newMarker = new kakao.maps.Marker({
                        map: kakaoMap,
                        position: new kakao.maps.LatLng(latitude, longitude),
                        image: customMarkerImage?.icon,
                    });
                    setMarkers(newMarker);
                } else {
                    // 주소가 아예 존재하지 않을 때
                    setMarkers(null);
                }
            };
            geocoderTest.addressSearch(userAddress, callback);
        }

        //마이페이지 위 상점 마커들 띄우기
        if (!userAddress) {
            const geocoder = new kakao.maps.services.Geocoder();
            storeAddress.forEach((address) => {
                geocoder.addressSearch(address, (result: any, status: any) => {
                    if (status === kakao.maps.services.Status.OK) {
                        const latitude = result[0].y;
                        const longitude = result[0].x;
                        const customMarkerImage = createCustomMarkerImage();

                        const newMarker = new kakao.maps.Marker({
                            map: kakaoMap,
                            position: new kakao.maps.LatLng(latitude, longitude),
                            image: customMarkerImage?.iconTwo, // iconTwo를 사용하여 상점 위치에 대한 마커 생성
                        });
                        setStoreMarkers((prevMarkers) => [...prevMarkers, newMarker]);
                    }
                });
            });
        }
    }, [kakaoMap, userAddress, isSearched]);

    useEffect(() => {
        if (isSearched) {
            callCreateUserLocation();
        }
    }, [isSearched, marker]);
    return <div id="container" style={{ width: '100vw', height: '50vh' }} />;
}

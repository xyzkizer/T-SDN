class ServiceEndPointController < SDN

  get '/?' do
    content_type :json

    respond = {}
    top = []

    JSON.parse($redis.get(%Q(#{$redis.get("root-topology")}.serviceEndPoint))).each do |sep|
      name = sep["name"][0]["value"]
      typo, node, type = name.split('_').map { |pair|
        pair.partition('/').first
      }
      top << [typo, node, type, name]
    end

    names = top.map {|t| t[3]}

    # to be shortcut,
    topos = JSON.parse("[]")
    top.each do |t|

      topo = topos.detect {|e| e["name"] == t[0] }
      unless topo
        topo = {"name" => t[0], "expanded"=>true, "nodes" => []}
        topos << topo
      end

      node = topo["nodes"].detect {|e| e["name"] == t[1]}
      unless node
        node = {"name" => t[1], "expanded"=>true, "nodes" => []}
        topo["nodes"] << node
      end

      type = node["nodes"].detect {|e| e["name"] == t[2]}
      unless type
        type = {"name" => t[2], "nodes" => [{"name"=>t[3], "endpoint"=>true}]}
        node["nodes"] << type
      end

      name = type["nodes"].detect {|e| e["name"] == t[3]}
      unless name
        name = {"name" => t[3], "endpoint"=>true}
        type["nodes"] << name
      end
    end

    respond['topos'] = topos
    respond['seps'] = names
    respond.to_json
  end

  get %r{/(?<name>.+)/?} do
    $redis.get(%Q(#{params[:name]}))
  end
end

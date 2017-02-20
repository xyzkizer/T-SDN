class ServiceEndPointController < SDN

  get '/?' do
    content_type :json

    top = []
    @user = Manager.first(:id => session[:user_id])
    begin
      if @user
        user_seps = @user.seps.map { |s| s.sep_id }
        JSON.parse($redis.get(%Q(hw_tsdn.node))).each do |node|
          eth = $redis.get(%Q(#{node}.pktLink))
          odu = $redis.get(%Q(#{node}.clientPort))

          enodes = JSON.parse(eth ||= "[]").reject { |s|
            (@user.role != 'admin' and !user_seps.include? s) or JSON.parse($redis.get(s))["role"] != 1
          }.map { |s| {"name" => s, "type" => "eth" }}

          onodes = JSON.parse(odu ||= "[]").reject { |s|
            @user.role != 'admin' and !user_seps.include? s
          }.map { |s| {"name" => s, "type" => "odu" }}

          nodes = []
          unless enodes.empty?
            nodes << {
                "name" => "ETH",
                "nodes" => enodes
            }
          end
          unless onodes.empty?
            nodes << {
                "name" => "ODU",
                "nodes" => onodes
            }
          end
          top << {"name" => node, "nodes" => nodes}
        end
      else
        [401, %Q({"message":"user not exists."})]
      end
    rescue Exception => ex
      logger.error ex
    ensure
    end
    [200, top.to_json]
  end

  get %r{/(?<name>.+)/?} do
    sep = JSON.parse($redis.get(%Q(#{params[:name]})))
    sep.to_json
  end
end
